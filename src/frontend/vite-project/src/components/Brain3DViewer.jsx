import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

// 4 Fő Kognitív Agyközpont és azok 3D koordinátái
export const BRAIN_REGIONS = {
  visual_cortex: {
    pos: new THREE.Vector3(0, -0.2, -1.9),
    label: 'Látókéreg (V1)',
    sub: 'Szöveg vizuális észlelése',
    color: '#38bdf8'
  },
  wernicke_area: {
    pos: new THREE.Vector3(-1.4, 0.2, -0.4),
    label: 'Wernicke-központ',
    sub: 'Szemantika és szófelismerés',
    color: '#818cf8'
  },
  broca_area: {
    pos: new THREE.Vector3(-1.3, 0.5, 0.9),
    label: 'Broca-központ',
    sub: 'Nyelvtan és belső beszéd',
    color: '#f59e0b'
  },
  prefrontal_cortex: {
    pos: new THREE.Vector3(0, 0.9, 1.9),
    label: 'Prefrontális kéreg',
    sub: 'Munkamemória és döntéshozatal',
    color: '#ef4444'
  }
};

// Procedurális agyfélteke geometria generálása anatómiai barázdákkal (sulci & gyri)
function createHemisphereGeometry(isLeft = true) {
  const geo = new THREE.SphereGeometry(1.65, 36, 28);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Sagittalis nyújtás és függőleges arányosítás
    z *= 1.25;
    y *= 0.95;
    x *= 0.75;

    // Féltekék elválasztása a mediális hasadéknál (longitudinal fissure)
    if (isLeft && x > 0.05) x *= 0.15;
    if (!isLeft && x < -0.05) x *= 0.15;

    // Agytekervények és barázdák matematikai eltolása
    const fold =
      Math.sin(x * 5.0) * Math.cos(y * 5.0) * Math.sin(z * 4.5) * 0.07 +
      Math.sin(z * 8.0) * 0.03;
    x += fold;
    y += fold;
    z += fold;

    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

// 3D Transzlucens Agykéreg Modell
function BrainCortex({ isDifficult }) {
  const leftGeo = useMemo(() => createHemisphereGeometry(true), []);
  const rightGeo = useMemo(() => createHemisphereGeometry(false), []);

  const cortexMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isDifficult ? '#31102b' : '#0b192c',
        emissive: isDifficult ? '#7f1d1d' : '#1e3a8a',
        emissiveIntensity: isDifficult ? 0.35 : 0.2,
        roughness: 0.3,
        metalness: 0.4,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide
      }),
    [isDifficult]
  );

  const wireMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: isDifficult ? '#f87171' : '#38bdf8',
        wireframe: true,
        transparent: true,
        opacity: isDifficult ? 0.12 : 0.07
      }),
    [isDifficult]
  );

  return (
    <group>
      {/* Bal félteke */}
      <group position={[-0.15, 0, 0]}>
        <mesh geometry={leftGeo} material={cortexMaterial} />
        <mesh geometry={leftGeo} material={wireMaterial} />
      </group>

      {/* Jobb félteke */}
      <group position={[0.15, 0, 0]}>
        <mesh geometry={rightGeo} material={cortexMaterial} />
        <mesh geometry={rightGeo} material={wireMaterial} />
      </group>

      {/* Kisagy (Cerebellum) hátul alul */}
      <mesh position={[-0.55, -0.9, -1.2]} scale={[0.6, 0.45, 0.65]}>
        <sphereGeometry args={[1, 16, 16]} />
        <primitive object={cortexMaterial} />
      </mesh>
      <mesh position={[0.55, -0.9, -1.2]} scale={[0.6, 0.45, 0.65]}>
        <sphereGeometry args={[1, 16, 16]} />
        <primitive object={cortexMaterial} />
      </mesh>

      {/* Agytörzs (Brainstem) */}
      <mesh position={[0, -1.25, -0.6]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.9, 16]} />
        <primitive object={cortexMaterial} />
      </mesh>
    </group>
  );
}

// Idegsejt pontfelhő (Synaptic Point Cloud)
function NeuralPointCloud({ isDifficult }) {
  const pointsRef = useRef();

  const { positions, baseColors } = useMemo(() => {
    const count = 900;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const u = Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.3 + Math.random() * 0.3;

      let x = r * 0.72 * Math.sin(phi) * Math.cos(theta) + side * 0.25;
      let y = r * 0.88 * Math.sin(phi) * Math.sin(theta);
      let z = r * 1.2 * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      col[i * 3] = 0.2;
      col[i * 3 + 1] = 0.6;
      col[i * 3 + 2] = 0.9;
    }
    return { positions: pos, baseColors: col };
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime();
      const speed = isDifficult ? 2.5 : 1.0;
      pointsRef.current.rotation.y = Math.sin(t * 0.15 * speed) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isDifficult ? 0.055 : 0.04}
        color={isDifficult ? '#fb923c' : '#38bdf8'}
        transparent
        opacity={isDifficult ? 0.75 : 0.5}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 3D Szinaptikus Pálya és Akciós Potenciál Impulzusok (Synaptic Pathway)
function SynapseTract({ fromPos, toPos, color, speed = 1, particleCount = 2, intensity = 1, isDifficult = false }) {
  const curve = useMemo(() => {
    // Ívelt pálya a lebenyek között a mély fehérállományon / kérgen át
    const mid = new THREE.Vector3()
      .addVectors(fromPos, toPos)
      .multiplyScalar(0.5);

    // Kifelé és felfelé ívelés
    const offset = new THREE.Vector3(
      mid.x * 0.35,
      mid.y + (isDifficult ? 0.8 : 0.5),
      mid.z * 0.25
    );
    return new THREE.QuadraticBezierCurve3(fromPos, offset, toPos);
  }, [fromPos, toPos, isDifficult]);

  const tubeGeo = useMemo(() => {
    return new THREE.TubeGeometry(curve, 32, 0.022 * intensity, 8, false);
  }, [curve, intensity]);

  // Több részecske az útvonalon az áramlás ábrázolására
  const particlesRef = useRef([]);
  const progressRefs = useRef(
    Array.from({ length: particleCount }, (_, idx) => idx / particleCount)
  );

  useFrame((_, delta) => {
    for (let i = 0; i < particleCount; i++) {
      progressRefs.current[i] = (progressRefs.current[i] + delta * 0.5 * speed) % 1;
      const mesh = particlesRef.current[i];
      if (mesh) {
        mesh.position.copy(curve.getPoint(progressRefs.current[i]));
      }
    }
  });

  return (
    <group>
      {/* 3D Volumetrikus Idegrost (Axon Traktus) */}
      <mesh geometry={tubeGeo}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isDifficult ? 0.8 : 0.4}
          transparent
          opacity={isDifficult ? 0.65 : 0.4}
          roughness={0.4}
        />
      </mesh>

      {/* Áramló akciós potenciálok (Action Potential Vesicles) */}
      {Array.from({ length: particleCount }).map((_, idx) => (
        <mesh
          key={idx}
          ref={(el) => (particlesRef.current[idx] = el)}
        >
          <sphereGeometry args={[isDifficult ? 0.08 : 0.065, 12, 12]} />
          <meshBasicMaterial
            color={isDifficult ? '#fef08a' : '#ffffff'}
          />
        </mesh>
      ))}
    </group>
  );
}

// Agyi Régió Csomópont (Glow Sphere + 3D HTML Label)
function RegionHub({ id, info, loadScore, isDifficult }) {
  const hubRef = useRef();

  useFrame(({ clock }) => {
    if (hubRef.current) {
      const pulseSpeed = 1.5 + loadScore * 3;
      const scale = 1 + Math.sin(clock.getElapsedTime() * pulseSpeed) * (0.15 * loadScore);
      hubRef.current.scale.set(scale, scale, scale);
    }
  });

  const hubColor =
    loadScore > 0.75
      ? '#ef4444'
      : loadScore > 0.45
      ? '#f59e0b'
      : '#38bdf8';

  return (
    <group position={info.pos}>
      {/* Központi mag */}
      <mesh ref={hubRef}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color={hubColor}
          emissive={hubColor}
          emissiveIntensity={0.8 + loadScore * 0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Külső pulzáló aura gyűrű */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.38, 24]} />
        <meshBasicMaterial
          color={hubColor}
          transparent
          opacity={0.3 + loadScore * 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3D HTML Felirat és Terhelési Indikátor */}
      <Html position={[0, 0.55, 0]} center distanceFactor={8} zIndexRange={[100, 0]}>
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: `1px solid ${hubColor}`,
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#f8fafc',
            whiteSpace: 'nowrap',
            boxShadow: `0 0 12px ${hubColor}40`,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          <div style={{ fontWeight: 'bold' }}>{info.label}</div>
          <div style={{ fontSize: '9px', color: '#94a3b8' }}>{info.sub}</div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: '700',
              color: hubColor
            }}
          >
            Aktivitás: {Math.round(loadScore * 100)}%
          </div>
        </div>
      </Html>
    </group>
  );
}

// Fő 3D Komponens
export default function Brain3DViewer({
  synapseRoutes = [],
  documentData = null,
  selectedSegment = null,
  initialDifficulty = null
}) {
  // Vezérlő mód: 'easy' (Könnyű), 'hard' (Nehéz), vagy 'auto' (Szövegből származtatott)
  const [activeMode, setActiveMode] = useState('auto');

  // Határozzuk meg az aktuális nehézségi szintet
  const effectiveDifficulty = useMemo(() => {
    if (activeMode === 'easy') return 'easy';
    if (activeMode === 'hard') return 'hard';

    // Ha van kijelölt mondat/kiemelés
    if (selectedSegment) {
      const color = selectedSegment.color_code || selectedSegment.color || '';
      if (color.includes('EF4444') || color.includes('F97316') || selectedSegment.difficulty > 6) {
        return 'hard';
      }
      return 'easy';
    }

    // Ha van dokumentum kognitív modellje
    if (documentData?.cognitive_model?.semantic_complexity_score > 6) {
      return 'hard';
    }

    return initialDifficulty || 'easy';
  }, [activeMode, selectedSegment, documentData, initialDifficulty]);

  const isDifficult = effectiveDifficulty === 'hard';

  // Kognitív terhelési pontok az agyterületekre (0.0 - 1.0)
  const regionLoads = useMemo(() => {
    if (isDifficult) {
      // Nehéz szöveg: Munkamemória (Prefrontális) és Szintaxis (Broca) túlterhelődik!
      return {
        visual_cortex: 0.85,
        wernicke_area: 0.88,
        broca_area: 0.94,
        prefrontal_cortex: 0.98
      };
    } else {
      // Könnyű szöveg: Folyékony olvasás, domináns a vizuális és szemantikai feldolgozás
      return {
        visual_cortex: 0.7,
        wernicke_area: 0.45,
        broca_area: 0.18,
        prefrontal_cortex: 0.22
      };
    }
  }, [isDifficult]);

  // Információáramlási útvonalak a nehézség szerint
  const routes = useMemo(() => {
    if (isDifficult) {
      // NEHÉZ SZÖVEG ÁRAMLÁS:
      // 1. Látókéreg -> Wernicke (Dekódolási kísérlet)
      // 2. Wernicke -> Broca (Nyelvtani újraelemzés)
      // 3. Broca -> Prefrontális (Munkamemória bevonása)
      // 4. Prefrontális -> Wernicke (Kognitív elakadás miatti visszacsatolási hurok!)
      // 5. Prefrontális -> Broca (Belső beszéd újraindítása)
      return [
        { from: 'visual_cortex', to: 'wernicke_area', color: '#f59e0b', speed: 2.2, count: 3, intensity: 1.1 },
        { from: 'wernicke_area', to: 'broca_area', color: '#f97316', speed: 2.4, count: 3, intensity: 1.2 },
        { from: 'broca_area', to: 'prefrontal_cortex', color: '#ef4444', speed: 2.6, count: 4, intensity: 1.4 },
        { from: 'prefrontal_cortex', to: 'wernicke_area', color: '#ec4899', speed: 2.0, count: 3, intensity: 1.0 },
        { from: 'prefrontal_cortex', to: 'broca_area', color: '#ef4444', speed: 2.2, count: 3, intensity: 1.1 }
      ];
    } else {
      // KÖNNYŰ SZÖVEG ÁRAMLÁS:
      // Folyékony, egyirányú, alacsony ellenállású közvetlen áramlás
      // 1. Látókéreg -> Wernicke (Automata felismerés)
      // 2. Wernicke -> Prefrontális (Könnyed megértés, nincs elakadás)
      return [
        { from: 'visual_cortex', to: 'wernicke_area', color: '#10b981', speed: 1.3, count: 2, intensity: 0.9 },
        { from: 'wernicke_area', to: 'prefrontal_cortex', color: '#06b6d4', speed: 1.1, count: 2, intensity: 0.8 },
        { from: 'wernicke_area', to: 'broca_area', color: '#3b82f6', speed: 0.9, count: 1, intensity: 0.6 }
      ];
    }
  }, [isDifficult]);

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#020617',
        borderRadius: '16px',
        border: '1px solid #1e293b',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 1. Fejléc és Interaktív Módválasztó Vezérlősáv */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '14px 20px',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          borderBottom: '1px solid #1e293b',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🧠</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
              Kognitív 3D Agy és Szinaptikus Áramlás
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              Valós idejű információáramlás a nehéz vs. könnyű szövegrészek feldolgozásakor
            </p>
          </div>
        </div>

        {/* Módválasztó gombok */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setActiveMode('easy')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: 'pointer',
              border: activeMode === 'easy' ? '1px solid #10b981' : '1px solid #334155',
              backgroundColor: activeMode === 'easy' ? 'rgba(16, 185, 129, 0.25)' : '#1e293b',
              color: activeMode === 'easy' ? '#34d399' : '#94a3b8',
              transition: 'all 0.2s ease'
            }}
          >
            🟢 Könnyű szakasz
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('hard')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: 'pointer',
              border: activeMode === 'hard' ? '1px solid #ef4444' : '1px solid #334155',
              backgroundColor: activeMode === 'hard' ? 'rgba(239, 68, 68, 0.25)' : '#1e293b',
              color: activeMode === 'hard' ? '#f87171' : '#94a3b8',
              transition: 'all 0.2s ease'
            }}
          >
            🔴 Nehéz szakasz
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('auto')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: 'pointer',
              border: activeMode === 'auto' ? '1px solid #38bdf8' : '1px solid #334155',
              backgroundColor: activeMode === 'auto' ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
              color: activeMode === 'auto' ? '#38bdf8' : '#94a3b8',
              transition: 'all 0.2s ease'
            }}
          >
            ⚡ Szövegfüggő
          </button>
        </div>
      </div>

      {/* 2. Háromdimenziós WebGL Canvas */}
      <div style={{ width: '100%', height: '480px', position: 'relative' }}>
        {/* Állapotleíró lebegő doboz a bal felső sarokban */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 10,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${isDifficult ? '#ef4444' : '#10b981'}`,
            padding: '10px 14px',
            borderRadius: '10px',
            maxWidth: '320px',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: isDifficult ? '#f87171' : '#34d399',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{isDifficult ? '⚠️ Magas Kognitív Terhelés' : '✨ Folyékony Olvasási Áramlás'}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
            {isDifficult
              ? 'Az összetett szintaxis és a nehéz kifejezések miatt visszacsatolási hurok alakult ki a Prefrontális és Broca központok között. Munkamemória túlterheltség.'
              : 'Egyenletes, lamináris áramlás a Látókéregből a Wernicke-terület felé. A munkamemória tehermentesített, az olvasás folyamatos.'}
          </div>
        </div>

        {/* Telemetria a jobb felső sarokban */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #334155',
            padding: '10px 14px',
            borderRadius: '10px',
            minWidth: '180px',
            pointerEvents: 'none',
            fontSize: '11px',
            color: '#e2e8f0'
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '8px', color: '#94a3b8' }}>
            KOGNITÍV METRIKÁK
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Munkamemória:</span>
            <span style={{ fontWeight: 'bold', color: isDifficult ? '#ef4444' : '#10b981' }}>
              {isDifficult ? '98% (Kritikus)' : '22% (Optimális)'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Áramlási sebesség:</span>
            <span style={{ fontWeight: 'bold', color: isDifficult ? '#f59e0b' : '#38bdf8' }}>
              {isDifficult ? 'Gyors / Pulzáló' : 'Nyugodt / Stabil'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Aktív szinapszisok:</span>
            <span style={{ fontWeight: 'bold', color: '#f8fafc' }}>{routes.length} fő traktus</span>
          </div>
        </div>

        <Canvas
          camera={{ position: [0, 2.5, 5.2], fov: 48 }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 15, 10]} intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <OrbitControls
            enableZoom={true}
            autoRotate={true}
            autoRotateSpeed={0.4}
            minDistance={3}
            maxDistance={8}
          />

          {/* 3D Agykéreg Forma */}
          <BrainCortex isDifficult={isDifficult} />

          {/* Idegsejt pontfelhő */}
          <NeuralPointCloud isDifficult={isDifficult} />

          {/* 4 Fő Kognitív Központ */}
          {Object.entries(BRAIN_REGIONS).map(([key, info]) => (
            <RegionHub
              key={key}
              id={key}
              info={info}
              loadScore={regionLoads[key] || 0.3}
              isDifficult={isDifficult}
            />
          ))}

          {/* Szinaptikus Pályák és Impulzusok */}
          {routes.map((route, idx) => (
            <SynapseTract
              key={`${route.from}-${route.to}-${idx}-${isDifficult}`}
              fromPos={BRAIN_REGIONS[route.from].pos}
              toPos={BRAIN_REGIONS[route.to].pos}
              color={route.color}
              speed={route.speed}
              particleCount={route.count}
              intensity={route.intensity}
              isDifficult={isDifficult}
            />
          ))}
        </Canvas>
      </div>

      {/* 3. Magyarázó alsó lábléc az áramlás neurobiológiájáról */}
      <div
        style={{
          padding: '12px 20px',
          backgroundColor: '#090d16',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '11px',
          color: '#94a3b8'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'inline-block' }} />
          <span><b>Látókéreg:</b> Nyomtatott/képernyő szimbólumok beolvasása</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#818cf8', display: 'inline-block' }} />
          <span><b>Wernicke:</b> Mentális lexikon &amp; szemantika</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
          <span><b>Broca:</b> Nyelvtani szintaxis &amp; artikulációs hurok</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
          <span><b>Prefrontális:</b> Munkamemória &amp; megértés-ellenőrzés</span>
        </div>
      </div>
    </div>
  );
}