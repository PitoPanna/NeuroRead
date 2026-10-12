import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

const BRAIN_REGIONS = {
  visual_cortex: { pos: new THREE.Vector3(0, 0, -2), label: 'Látókéreg' },
  wernicke_area: { pos: new THREE.Vector3(-1.5, 0.5, -0.5), label: 'Wernicke' },
  broca_area: { pos: new THREE.Vector3(-1.2, 0.8, 0.8), label: 'Broca' },
  prefrontal_cortex: { pos: new THREE.Vector3(0, 1, 2), label: 'Prefrontális' }
};

const DEFAULT_ROUTES = [
  { from_area: 'visual_cortex', to_area: 'wernicke_area' },
  { from_area: 'wernicke_area', to_area: 'broca_area' },
  { from_area: 'broca_area', to_area: 'prefrontal_cortex' }
];

function SynapseSignal({ fromPos, toPos, color = '#38bdf8' }) {
  const particleRef = useRef();
  const tRef = useRef(0);

  const curve = useMemo(() => {
    const mid = new THREE.Vector3()
      .addVectors(fromPos, toPos)
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(0, 1.2, 0));
    return new THREE.QuadraticBezierCurve3(fromPos, mid, toPos);
  }, [fromPos, toPos]);

  const points = useMemo(() => curve.getPoints(50), [curve]);

  useFrame((_, delta) => {
    tRef.current = (tRef.current + delta * 0.8) % 1;
    if (particleRef.current) {
      particleRef.current.position.copy(curve.getPoint(tRef.current));
    }
  });

  return (
    <group>
      <Line points={points} color={color} lineWidth={1.5} transparent opacity={0.5} />
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#60a5fa" />
      </mesh>
    </group>
  );
}

export default function Brain3DViewer({ synapseRoutes }) {
  const validRoutes = (synapseRoutes || []).filter(
    (r) => BRAIN_REGIONS[r.from_area] && BRAIN_REGIONS[r.to_area]
  );
  const routes = validRoutes.length > 0 ? validRoutes : DEFAULT_ROUTES;

  return (
    <div
      style={{
        width: '100%',
        height: '450px',
        backgroundColor: '#020617',
        borderRadius: '16px',
        border: '1px solid #1e293b',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#22d3ee',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid #1e293b'
        }}
      >
        🧠 3D Synaptic Brain Network (R3F)
      </div>

      <Canvas camera={{ position: [0, 3, 6], fov: 50 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />

        {Object.entries(BRAIN_REGIONS).map(([key, { pos, label }]) => (
          <group key={key} position={pos}>
            <Sphere args={[0.25, 32, 32]}>
              <meshStandardMaterial color="#818cf8" emissive="#4f46e5" emissiveIntensity={0.6} />
            </Sphere>
            <Html position={[0, 0.45, 0]} center distanceFactor={8}>
              <div style={{ color: '#e0e7ff', fontSize: '12px', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                {label}
              </div>
            </Html>
          </group>
        ))}

        {routes.map((route, idx) => (
          <SynapseSignal
            key={idx}
            fromPos={BRAIN_REGIONS[route.from_area].pos}
            toPos={BRAIN_REGIONS[route.to_area].pos}
          />
        ))}
      </Canvas>
    </div>
  );
}