import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Single torus ring with gold material ── */
function Ring({ offset = 0, tilt = 0 }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const mesh = meshRef.current;
    if (!mesh) return;

    // Continuous rotation at different speeds per ring
    mesh.rotation.x = tilt + Math.sin(t * 0.8 + offset) * 0.3;
    mesh.rotation.y = t * 0.6 + offset;
    mesh.rotation.z = Math.cos(t * 0.5 + offset) * 0.15;

    // Gentle breathing scale
    const breathe = 1 + Math.sin(t * 1.2 + offset) * 0.03;
    mesh.scale.setScalar(breathe);
  });

  return (
    <mesh ref={meshRef} position={[offset * 0.55, 0, 0]}>
      <torusGeometry args={[1, 0.12, 48, 128]} />
      <meshStandardMaterial
        color="#d4af37"
        metalness={1}
        roughness={0.18}
        emissive="#c9a84c"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

/* ── Orbiting sparkle particles around the rings ── */
function Sparkles() {
  const pointsRef = useRef();
  const count = 60;

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1.5 + Math.random() * 0.8;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      sz[i] = Math.random() * 3 + 1;
    }
    return [pos, sz];
  }, []);

  useFrame(({ clock }) => {
    const pts = pointsRef.current;
    if (!pts) return;
    pts.rotation.y = clock.getElapsedTime() * 0.15;
    pts.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#f0d080"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Signals the canvas is ready after first frame renders ── */
function ReadyNotifier({ onReady }) {
  const called = useRef(false);
  useFrame(() => {
    if (!called.current) {
      called.current = true;
      onReady?.();
    }
  });
  return null;
}

/* ── Exported canvas wrapper ── */
export default function GoldenRings({ onReady }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Lighting — no Environment map needed, instant render */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#fff8e1" />
      <directionalLight position={[-4, -2, 3]} intensity={0.5} color="#c9a84c" />
      <pointLight position={[0, 2, 4]} intensity={0.8} color="#f0d080" />
      <pointLight position={[0, -2, 3]} intensity={0.3} color="#fff" />

      {/* Two interlocking rings — offset and tilted */}
      <group>
        <Ring offset={-1} tilt={0.4} />
        <Ring offset={1} tilt={-0.4} />
      </group>

      <Sparkles />
      <ReadyNotifier onReady={onReady} />
    </Canvas>
  );
}
