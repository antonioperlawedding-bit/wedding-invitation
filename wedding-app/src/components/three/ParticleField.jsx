import { useRef, useEffect } from 'react';
import * as THREE from 'three';

/* -------------------------------------------------------
   Custom GLSL Shaders
------------------------------------------------------- */
const VERTEX_SHADER = /* glsl */`
  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aRandom;

  uniform float uTime;
  uniform float uMouseX;
  uniform float uMouseY;
  uniform float uScrollY;

  varying float vAlpha;
  varying vec3  vColor;

  // Two golden tones + warm white highlight
  vec3 gold1  = vec3(0.784, 0.659, 0.298); // #c9a84c
  vec3 gold2  = vec3(0.941, 0.816, 0.502); // #f0d080
  vec3 white  = vec3(0.996, 0.980, 0.953); // warm white

  void main() {
    vec3 pos = position;

    // Gentle upward float (each particle loops independently)
    float t = mod(uTime * aSpeed * 0.25 + aPhase, 12.0) - 6.0;

    // Lissajous-like horizontal drift
    pos.x += sin(uTime * aSpeed * 0.4 + aPhase * 2.39) * 0.35;
    pos.y += t;
    pos.z += cos(uTime * aSpeed * 0.3 + aPhase * 1.57) * 0.2;

    // Subtle mouse attraction (cosmetic only)
    pos.x += uMouseX * 0.15 * aRandom;
    pos.y += uMouseY * 0.10 * aRandom;

    // Scroll parallax depth
    pos.y -= uScrollY * 0.0012 * (0.5 + aRandom * 0.5);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Point-size scales with camera distance + particle-size attr
    gl_PointSize = aSize * (320.0 / -mvPosition.z);
    gl_Position  = projectionMatrix * mvPosition;

    // Colour: shimmer between the two golds, rare white sparkles
    float shimmer = sin(uTime * 1.8 + aPhase * 6.28) * 0.5 + 0.5;
    vColor = mix(gold1, gold2, shimmer);
    if (aRandom > 0.85) vColor = white;

    // Alpha: fade near top/bottom of field
    float ny = clamp((pos.y + 6.0) / 12.0, 0.0, 1.0);
    vAlpha = 1.0 - abs(ny * 2.0 - 1.0);
    vAlpha = pow(vAlpha, 0.35) * 0.85;
  }
`;

const FRAGMENT_SHADER = /* glsl */`
  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    // Soft bokeh circle with inner glow
    vec2  uv   = gl_PointCoord - 0.5;
    float dist = length(uv);

    float core = 1.0 - smoothstep(0.00, 0.18, dist);
    float halo = 1.0 - smoothstep(0.18, 0.50, dist);
    float alpha = core * 0.95 + halo * 0.25;

    gl_FragColor = vec4(vColor, alpha * vAlpha);
  }
`;

/* -------------------------------------------------------
   Component
------------------------------------------------------- */
export default function ParticleField({ count = 1200, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ---- Renderer ---- */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    /* ---- Scene / Camera ---- */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 6;

    /* ---- Adaptive count ---- */
    const mobile      = window.innerWidth < 768;
    const actualCount = mobile ? Math.floor(count * 0.35) : count;

    /* ---- Geometry ---- */
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(actualCount * 3);
    const sizes     = new Float32Array(actualCount);
    const speeds    = new Float32Array(actualCount);
    const phases    = new Float32Array(actualCount);
    const randoms   = new Float32Array(actualCount);

    for (let i = 0; i < actualCount; i++) {
      // Spread across a wide slab in front of camera
      positions[i * 3]     = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;

      sizes[i]   = Math.random() * 3.5 + 1.0;
      speeds[i]  = Math.random() * 0.5 + 0.2;
      phases[i]  = Math.random() * Math.PI * 2;
      randoms[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aSpeed',   new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aRandom',  new THREE.BufferAttribute(randoms, 1));

    /* ---- Material ---- */
    const material = new THREE.ShaderMaterial({
      vertexShader:   VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime:    { value: 0 },
        uMouseX:  { value: 0 },
        uMouseY:  { value: 0 },
        uScrollY: { value: 0 },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    /* ---- Mouse ---- */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = (e) => {
      mouse.tx = (e.clientX / window.innerWidth)  *  2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * -2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    /* ---- Resize ---- */
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* ---- Scroll ---- */
    const onScroll = () => {
      material.uniforms.uScrollY.value = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---- Animation Loop ---- */
    let frameId;
    let time = 0;
    const tick = () => {
      frameId = requestAnimationFrame(tick);
      time += 0.005;
      material.uniforms.uTime.value = time;

      // Smoothly lerp mouse
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      material.uniforms.uMouseX.value = mouse.x;
      material.uniforms.uMouseY.value = mouse.y;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
