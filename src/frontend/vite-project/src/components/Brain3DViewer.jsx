import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// agyteruletek
const BRAIN_REGIONS = {
  visual_cortex: new THREE.Vector3(0, 0, -2),       // tarko
  wernicke_area: new THREE.Vector3(-1.5, 0.5, -0.5),  // bal hátsó nyelvi zóna
  broca_area: new THREE.Vector3(-1.2, 0.8, 0.8),     // bal elülső nyelvtani zóna
  prefrontal_cortex: new THREE.Vector3(0, 1, 2)      // Homloklebeny / Munkamemória
};

// szinaptikus jelvonal komponens
function SynapseSignal({ fromPos, toPos, color = "#38bdf8" }) {
  const particleRef = useRef();

  // 3D Bezier-palya
  const midPoint = new THREE.Vector3()
    .addVectors(fromPos, toPos)
    .multiplyScalar(0.5)
    .add(new THREE.Vector3(0, 1.2, 0)); // Íves kiemelkedés

  const curve = new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);

  // a reszecske haladasa az iven
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.8) % 1;
    const point = curve.getPoint(t);
    if (particleRef.current) {
      particleRef.current.position.copy(point);
    }
  });

  const points = curve.getPoints(50);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group>
      {/* Halvány 3D szinaptikus ív */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial attach="material" color={color} opacity={0.3} transparent />
      </line>

      {/* Futó fényimpulzus */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#60a5fa" />
      </mesh>
    </group>
  );
}

//agy modell
export default function Brain3DViewer({ synapseRoutes }) {
  return (
    <div className="w-full h-[450px] bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden shadow-2xl">
      {/* Badge / Info felirat */}
      <div className="absolute top-4 left-4 z-10 text-xs font-mono text-cyan-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-md shadow-md">
        🧠 3D Synaptic Brain Network (R3F)
      </div>

      <Canvas camera={{ position: [0, 3, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {/* Interaktív forgatás & nagyítás */}
        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />

        {/* 1. Agyterületek mint világító 3D Gömbök */}
        {Object.entries(BRAIN_REGIONS).map(([key, pos]) => (
          <group key={key} position={pos}>
            <Sphere args={[0.25, 32, 32]}>
              <meshStandardMaterial color="#818cf8" emissive="#4f46e5" emissiveIntensity={0.6} />
            </Sphere>
          </group>
        ))}

        {/* 2. Szinaptikus Jelvonalak az LLM válasz alapján */}
        {synapseRoutes && synapseRoutes.map((route, idx) => {
          const from = BRAIN_REGIONS[route.from_area];
          const to = BRAIN_REGIONS[route.to_area];

          if (!from || !to) return null;

          return <SynapseSignal key={idx} fromPos={from} toPos={to} />;
        })}
      </Canvas>
    </div>
  );
}