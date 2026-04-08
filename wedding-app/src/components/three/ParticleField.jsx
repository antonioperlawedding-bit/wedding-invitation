import { useRef, useEffect } from 'react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════
   Golden Sanctum — Luxury 3D Parallax Background
   Multi-layered depth scene with lit golden rings
   (interlocking wedding-band motifs), diamond crystals,
   volumetric light rays, and refined gold dust.
   4 parallax groups respond to mouse & scroll.
   ═══════════════════════════════════════════════════════════ */

/* ─── Gold Dust (Point) Shaders ─── */
const DUST_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;

  uniform float uTime;
  uniform float uPixelRatio;

  varying float vAlpha;
  varying vec3  vColor;

  vec3 gold1 = vec3(0.800, 0.620, 0.141);
  vec3 gold2 = vec3(0.976, 0.800, 0.004);

  void main() {
    vec3 pos = position;

    // Slow upward float with horizontal drift
    float t = mod(uTime * aSpeed * 0.12 + aPhase, 10.0) - 5.0;
    pos.y += t;
    pos.x += sin(uTime * aSpeed * 0.2 + aPhase * 3.17) * 0.25;
    pos.z += cos(uTime * aSpeed * 0.15 + aPhase * 2.41) * 0.15;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uPixelRatio * (200.0 / -mvPos.z);
    gl_Position  = projectionMatrix * mvPos;

    // Shimmer between two golds
    float shimmer = sin(uTime * 1.2 + aPhase * 6.28) * 0.5 + 0.5;
    vColor = mix(gold1, gold2, shimmer);

    // Fade at vertical extremes
    float ny = clamp((pos.y + 5.0) / 10.0, 0.0, 1.0);
    vAlpha = 1.0 - abs(ny * 2.0 - 1.0);
    vAlpha = pow(vAlpha, 0.5) * 0.5;
  }
`;

const DUST_FRAG = /* glsl */ `
  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    float core = 1.0 - smoothstep(0.0, 0.15, d);
    float glow = 1.0 - smoothstep(0.15, 0.5, d);
    float alpha = core * 0.9 + glow * 0.2;
    gl_FragColor = vec4(vColor, alpha * vAlpha);
  }
`;

/* ─── Light Ray Shaders ─── */
const RAY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RAY_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    float beam = 1.0 - abs(vUv.x - 0.5) * 2.0;
    beam = pow(beam, 3.0);
    float fade  = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
    float pulse = 0.85 + 0.15 * sin(uTime * 0.3 + vUv.y * 4.0);
    float alpha = beam * fade * uOpacity * pulse;
    vec3 color = mix(vec3(0.800, 0.620, 0.141), vec3(0.976, 0.800, 0.004), vUv.y);
    gl_FragColor = vec4(color, alpha);
  }
`;

/* ─── Component ─── */
export default function ParticleField({ count = 1200, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio, mobile ? 1 : 1.5);

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !mobile,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;

    /* ── Scene ── */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a2e14, 0.04);

    /* ── Camera ── */
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 80);
    camera.position.z = 14;

    /* ── Lighting — dramatic gold illumination ── */
    scene.add(new THREE.AmbientLight(0x1a2e14, 0.6));

    const keyLight = new THREE.PointLight(0xdeb040, 3, 35, 1.5);
    keyLight.position.set(0, 10, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x9caf13, 1.2, 25, 1.5);
    rimLight.position.set(4, -8, 3);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xcc9e24, 0.6, 20, 2);
    fillLight.position.set(-6, 2, 8);
    scene.add(fillLight);

    /* ── 4 Parallax Depth Groups ── */
    const layers = [
      { group: new THREE.Group(), factor: 0.015 }, // 0: deepest
      { group: new THREE.Group(), factor: 0.04  }, // 1: mid-deep
      { group: new THREE.Group(), factor: 0.07  }, // 2: mid-near
      { group: new THREE.Group(), factor: 0.12  }, // 3: nearest
    ];
    layers.forEach(l => scene.add(l.group));

    const disposables = [];
    const animatedMeshes = [];

    /* ── Helper: create a gold ring mesh ── */
    const makeRing = (cfg) => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 80);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xdeb040,
        metalness: 0.92,
        roughness: 0.15,
        emissive: 0xcc9e24,
        emissiveIntensity: 0.12,
        transparent: true,
        opacity: cfg.opacity,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.set(cfg.rx ?? Math.random() * Math.PI, cfg.ry ?? Math.random() * Math.PI, cfg.rz ?? 0);
      mesh.userData = {
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.003,
          y: (Math.random() - 0.5) * 0.004,
          z: (Math.random() - 0.5) * 0.002,
        },
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: Math.random() * 0.15 + 0.05,
        floatSpeed: Math.random() * 0.3 + 0.15,
        origY: cfg.y,
      };
      layers[cfg.layer].group.add(mesh);
      animatedMeshes.push(mesh);
      disposables.push(geo, mat);
      return mesh;
    };

    /* ── Ring configurations ── */
    const ringDefs = mobile ? [
      // Mobile — fewer rings
      { layer: 0, radius: 2.8, tube: 0.018, x: -3,   y: 2,    z: -12, opacity: 0.20 },
      { layer: 0, radius: 1.8, tube: 0.015, x: 4,    y: -1.5, z: -10, opacity: 0.25 },
      { layer: 1, radius: 2.2, tube: 0.020, x: -2,   y: -2,   z: -7,  opacity: 0.32 },
      { layer: 1, radius: 1.4, tube: 0.018, x: 3,    y: 3,    z: -6,  opacity: 0.28 },
      { layer: 2, radius: 1.8, tube: 0.022, x: 0,    y: 0.5,  z: -3,  opacity: 0.38 },
      { layer: 2, radius: 1.0, tube: 0.020, x: -4,   y: 1,    z: -2.5,opacity: 0.32 },
      { layer: 3, radius: 0.8, tube: 0.025, x: 2.5,  y: -1,   z: -0.5,opacity: 0.28 },
    ] : [
      // Desktop — full layered set
      // Deep (layer 0)
      { layer: 0, radius: 3.5, tube: 0.015, x: -5,   y: 3,    z: -14, opacity: 0.14 },
      { layer: 0, radius: 2.5, tube: 0.012, x: 5,    y: -2,   z: -13, opacity: 0.16 },
      { layer: 0, radius: 4.0, tube: 0.012, x: 0,    y: -4,   z: -12, opacity: 0.12 },
      { layer: 0, radius: 1.8, tube: 0.015, x: -7,   y: 0,    z: -11, opacity: 0.18 },
      // Mid-deep (layer 1)
      { layer: 1, radius: 2.8, tube: 0.018, x: -3,   y: -2.5, z: -8,  opacity: 0.26 },
      { layer: 1, radius: 2.0, tube: 0.018, x: 4,    y: 3,    z: -7,  opacity: 0.30 },
      { layer: 1, radius: 1.5, tube: 0.015, x: -6,   y: 1,    z: -6.5,opacity: 0.24 },
      { layer: 1, radius: 3.2, tube: 0.015, x: 2,    y: -1,   z: -6,  opacity: 0.22 },
      // Mid-near (layer 2)
      { layer: 2, radius: 2.0, tube: 0.022, x: -1.5, y: 1.5,  z: -4,  opacity: 0.36 },
      { layer: 2, radius: 1.2, tube: 0.020, x: 5,    y: -3,   z: -3,  opacity: 0.32 },
      { layer: 2, radius: 2.5, tube: 0.018, x: -5,   y: -1,   z: -2.5,opacity: 0.28 },
      { layer: 2, radius: 0.9, tube: 0.022, x: 3,    y: 2,    z: -2,  opacity: 0.38 },
      // Near (layer 3)
      { layer: 3, radius: 1.0, tube: 0.028, x: 3,    y: -1.5, z: -0.5,opacity: 0.26 },
      { layer: 3, radius: 0.7, tube: 0.025, x: -3.5, y: 2.5,  z: 0,   opacity: 0.22 },
      { layer: 3, radius: 1.5, tube: 0.025, x: 0,    y: -3,   z: 0.5, opacity: 0.20 },
    ];

    ringDefs.forEach(makeRing);

    /* ── Interlocking ring pairs — wedding-band motif ── */
    const pairSpots = mobile
      ? [{ layer: 2, x: 1, y: 0, z: -3, r: 1.1, tube: 0.02, opacity: 0.35 }]
      : [
          { layer: 1, x: -2, y: 1,  z: -7, r: 1.6, tube: 0.018, opacity: 0.28 },
          { layer: 2, x: 2,  y: -1, z: -3, r: 1.1, tube: 0.022, opacity: 0.36 },
        ];
    pairSpots.forEach(s => {
      makeRing({ ...s, layer: s.layer, radius: s.r, x: s.x, y: s.y, z: s.z, rx: 0, ry: 0, rz: 0 });
      makeRing({ ...s, layer: s.layer, radius: s.r * 0.95, x: s.x, y: s.y, z: s.z, rx: Math.PI / 2, ry: Math.PI * 0.15, rz: 0 });
    });

    /* ── Diamond Crystals (Octahedrons) ── */
    const crystalCount = mobile ? 6 : 14;
    const zRanges = [-14, -8, -4, -1];
    for (let i = 0; i < crystalCount; i++) {
      const size = Math.random() * 0.22 + 0.08;
      const geo = new THREE.OctahedronGeometry(size);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf9cc01,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xcc9e24,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: Math.random() * 0.25 + 0.12,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const li = Math.floor(Math.random() * 4);
      mesh.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
        zRanges[li] + Math.random() * 3,
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.userData = {
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.008,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.006,
        },
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: Math.random() * 0.2 + 0.05,
        floatSpeed: Math.random() * 0.4 + 0.2,
        origY: mesh.position.y,
      };
      layers[li].group.add(mesh);
      animatedMeshes.push(mesh);
      disposables.push(geo, mat);
    }

    /* ── Volumetric Light Rays ── */
    const rayCount = mobile ? 2 : 4;
    const rayMaterials = [];
    for (let i = 0; i < rayCount; i++) {
      const geo = new THREE.PlaneGeometry(1.5 + Math.random(), 18);
      const mat = new THREE.ShaderMaterial({
        vertexShader: RAY_VERT,
        fragmentShader: RAY_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.035 + Math.random() * 0.025 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 8, 2, -6 + Math.random() * 4);
      mesh.rotation.z = (Math.random() - 0.5) * 0.3;
      layers[1].group.add(mesh);
      rayMaterials.push(mat);
      disposables.push(geo, mat);
    }

    /* ── Gold Dust Particles ── */
    const dustCount = mobile ? Math.floor(count * 0.2) : Math.floor(count * 0.45);
    const dustGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(dustCount * 3);
    const aSizes  = new Float32Array(dustCount);
    const aSpeeds = new Float32Array(dustCount);
    const aPhases = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2;
      aSizes[i]  = Math.random() * 1.4 + 0.3;
      aSpeeds[i] = Math.random() * 0.4 + 0.12;
      aPhases[i] = Math.random() * Math.PI * 2;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    dustGeo.setAttribute('aSize',    new THREE.BufferAttribute(aSizes, 1));
    dustGeo.setAttribute('aSpeed',   new THREE.BufferAttribute(aSpeeds, 1));
    dustGeo.setAttribute('aPhase',   new THREE.BufferAttribute(aPhases, 1));

    const dustMat = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: dpr },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    layers[2].group.add(new THREE.Points(dustGeo, dustMat));
    disposables.push(dustGeo, dustMat);

    /* ── Input tracking ── */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = (e) => {
      mouse.tx = (e.clientX / window.innerWidth)  *  2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * -2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let scrollY = 0;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── Resize ── */
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

    /* ── Render Loop ── */
    let frameId;
    let time = 0;

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      time += 0.008;

      // Smooth mouse lerp
      mouse.x += (mouse.tx - mouse.x) * 0.035;
      mouse.y += (mouse.ty - mouse.y) * 0.035;

      // Parallax layers — mouse + scroll
      const scrollOff = scrollY * 0.001;
      layers.forEach((l) => {
        l.group.position.x = mouse.x * l.factor * 5;
        l.group.position.y = mouse.y * l.factor * 3 - scrollOff * l.factor * 8;
      });

      // Animate rings & crystals — gentle rotate + float
      animatedMeshes.forEach(m => {
        const u = m.userData;
        m.rotation.x += u.rotSpeed.x;
        m.rotation.y += u.rotSpeed.y;
        m.rotation.z += u.rotSpeed.z;
        m.position.y = u.origY + Math.sin(time * u.floatSpeed + u.floatPhase) * u.floatAmp;
      });

      // Shader uniforms
      dustMat.uniforms.uTime.value = time;
      rayMaterials.forEach(m => { m.uniforms.uTime.value = time; });

      // Subtle key-light breathing
      keyLight.intensity = 3 + Math.sin(time * 0.2) * 0.4;

      // Camera micro-drift
      camera.position.x = Math.sin(time * 0.1) * 0.15;
      camera.position.y = Math.cos(time * 0.08) * 0.1;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      disposables.forEach(d => d.dispose());
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
