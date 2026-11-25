import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createHalftoneBuildingMaterial, createInkOutlineMaterial } from './HalftoneShader';

const ON_TWOS_STEP = 1 / 12; // ~12 fps stop-motion feel

// Across the Spider-Verse inspired multiverse palette
const ACCENT_PALETTE = [
  new THREE.Color('#ff2d95'), // hot magenta
  new THREE.Color('#00f0ff'), // electric cyan
  new THREE.Color('#ffe600'), // comic yellow
  new THREE.Color('#ff4d2e'), // dimensional coral-red
  new THREE.Color('#39ff9c'), // acid mint
];

function seededRandom(seed) {
  const x = Math.sin(seed * 91.3458) * 47453.5453;
  return x - Math.floor(x);
}

export default function StylizedCity({ isMobile, reducedMotion }) {
  const count = isMobile ? 36 : 82;
  const shardCount = isMobile ? 14 : 34;
  const streakCount = isMobile ? 14 : 36;

  const buildingsRef = useRef(null);
  const outlinesRef = useRef(null);
  const shardsRef = useRef(null);
  const shardOutlinesRef = useRef(null);
  const streaksRef = useRef(null);
  const portalGroupRef = useRef(null);

  const accRef = useRef(0);
  const steppedTimeRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const buildingMaterial = useMemo(() => createHalftoneBuildingMaterial(), []);
  const outlineMaterial = useMemo(() => createInkOutlineMaterial(0.055), []);
  const shardOutlineMaterial = useMemo(() => createInkOutlineMaterial(0.045), []);
  const streakMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.72,
      }),
    []
  );

  const buildingGeometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const col = ACCENT_PALETTE[i % ACCENT_PALETTE.length];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    geo.setAttribute('aAccent', new THREE.InstancedBufferAttribute(colors, 3));
    return geo;
  }, [count]);

  const shardGeometry = useMemo(() => {
    const geo = new THREE.OctahedronGeometry(0.55, 0);
    const colors = new Float32Array(shardCount * 3);
    for (let i = 0; i < shardCount; i += 1) {
      const col = ACCENT_PALETTE[(i + 2) % ACCENT_PALETTE.length];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    geo.setAttribute('aAccent', new THREE.InstancedBufferAttribute(colors, 3));
    return geo;
  }, [shardCount]);

  const streakGeometry = useMemo(() => new THREE.BoxGeometry(0.05, 0.05, 3.2), []);

  const buildingData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const cluster = i % 4;
      const angle = (i / count) * Math.PI * 2 + seededRandom(i + 3) * 0.55;
      const radius = 5.2 + cluster * 5.6 + seededRandom(i + 25) * 4.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius - 8.0;
      const w = 1.0 + seededRandom(i + 40) * 2.1;
      const h = 3.8 + seededRandom(i + 60) * 12.0;
      const d = 1.0 + seededRandom(i + 80) * 2.1;
      const y = -5.4 + seededRandom(i + 100) * 7.5;
      const bobSpeed = 0.65 + seededRandom(i + 120) * 0.8;
      const bobAmp = 0.2 + seededRandom(i + 140) * 0.36;
      const phase = seededRandom(i + 160) * Math.PI * 2;
      const tilt = (seededRandom(i + 180) - 0.5) * 0.2;
      const yaw = (seededRandom(i + 200) - 0.5) * 0.65;
      return { x, y, z, w, h, d, bobSpeed, bobAmp, phase, tilt, yaw };
    });
  }, [count]);

  const shardData = useMemo(() => {
    return Array.from({ length: shardCount }, (_, i) => {
      const angle = (i / shardCount) * Math.PI * 2;
      const radius = 4.0 + seededRandom(i + 300) * 15.0;
      return {
        x: Math.cos(angle) * radius,
        y: 0.4 + seededRandom(i + 320) * 10.0,
        z: Math.sin(angle) * radius - 7.0,
        scale: 0.38 + seededRandom(i + 340) * 0.72,
        speed: 0.8 + seededRandom(i + 360) * 1.1,
        phase: seededRandom(i + 380) * Math.PI * 2,
      };
    });
  }, [shardCount]);

  const streakData = useMemo(() => {
    return Array.from({ length: streakCount }, (_, i) => ({
      x: (seededRandom(i + 700) - 0.5) * 28,
      y: -2 + seededRandom(i + 720) * 13,
      zStart: -26 + seededRandom(i + 740) * 32,
      speed: 5.5 + seededRandom(i + 760) * 7.5,
      color: ACCENT_PALETTE[i % ACCENT_PALETTE.length],
    }));
  }, [streakCount]);

  const applyTransforms = (t) => {
    const bMesh = buildingsRef.current;
    const oMesh = outlinesRef.current;
    if (bMesh && oMesh) {
      for (let i = 0; i < buildingData.length; i += 1) {
        const b = buildingData[i];
        const offset = reducedMotion ? 0 : Math.sin(t * b.bobSpeed + b.phase) * b.bobAmp;
        dummy.position.set(b.x, b.y + offset, b.z);
        dummy.rotation.set(
          b.tilt,
          b.yaw + (reducedMotion ? 0 : Math.sin(t * 0.35 + b.phase) * 0.055),
          -b.tilt * 0.65
        );
        dummy.scale.set(b.w, b.h, b.d);
        dummy.updateMatrix();
        bMesh.setMatrixAt(i, dummy.matrix);
        oMesh.setMatrixAt(i, dummy.matrix);
      }
      bMesh.instanceMatrix.needsUpdate = true;
      oMesh.instanceMatrix.needsUpdate = true;
    }

    const sMesh = shardsRef.current;
    const soMesh = shardOutlinesRef.current;
    if (sMesh && soMesh) {
      for (let i = 0; i < shardData.length; i += 1) {
        const s = shardData[i];
        const bob = reducedMotion ? 0 : Math.sin(t * s.speed + s.phase) * 0.55;
        const rot = reducedMotion ? s.phase : t * s.speed * 0.72 + s.phase;
        dummy.position.set(s.x, s.y + bob, s.z);
        dummy.rotation.set(rot * 0.7, rot, rot * 0.4);
        dummy.scale.setScalar(s.scale);
        dummy.updateMatrix();
        sMesh.setMatrixAt(i, dummy.matrix);
        soMesh.setMatrixAt(i, dummy.matrix);
      }
      sMesh.instanceMatrix.needsUpdate = true;
      soMesh.instanceMatrix.needsUpdate = true;
    }

    const stMesh = streaksRef.current;
    if (stMesh) {
      for (let i = 0; i < streakData.length; i += 1) {
        const st = streakData[i];
        const zSpan = 34;
        const z = reducedMotion
          ? st.zStart
          : ((st.zStart + t * st.speed + 26) % zSpan) - 26;
        dummy.position.set(st.x, st.y, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        stMesh.setMatrixAt(i, dummy.matrix);
        stMesh.setColorAt(i, st.color);
      }
      stMesh.instanceMatrix.needsUpdate = true;
      if (stMesh.instanceColor) stMesh.instanceColor.needsUpdate = true;
    }

    // Step the Distant Dimensional Collider Vortex "on twos"
    if (portalGroupRef.current && !reducedMotion) {
      const rings = portalGroupRef.current.children;
      if (rings[0]) rings[0].rotation.z = t * 0.55;
      if (rings[1]) rings[1].rotation.z = -t * 0.8;
      if (rings[2]) rings[2].rotation.z = t * 1.05;
      if (rings[3]) rings[3].rotation.z = -t * 0.45;
      portalGroupRef.current.position.y = 5.4 + Math.sin(t * 0.9) * 0.35;
    }
  };

  useEffect(() => {
    applyTransforms(0);
    return () => {
      buildingGeometry.dispose();
      shardGeometry.dispose();
      streakGeometry.dispose();
      buildingMaterial.dispose();
      outlineMaterial.dispose();
      shardOutlineMaterial.dispose();
      streakMaterial.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, shardCount, streakCount, reducedMotion]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    accRef.current += Math.min(delta, 0.1);
    if (accRef.current < ON_TWOS_STEP) return;

    const steps = Math.floor(accRef.current / ON_TWOS_STEP);
    accRef.current -= steps * ON_TWOS_STEP;
    steppedTimeRef.current += steps * ON_TWOS_STEP;

    applyTransforms(steppedTimeRef.current);
  });

  return (
    <group>
      {/* Floating stylized geometric skyscrapers */}
      <instancedMesh
        ref={buildingsRef}
        args={[buildingGeometry, buildingMaterial, count]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={outlinesRef}
        args={[buildingGeometry, outlineMaterial, count]}
        frustumCulled={false}
      />

      {/* Floating geometric comic shards */}
      <instancedMesh
        ref={shardsRef}
        args={[shardGeometry, buildingMaterial, shardCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={shardOutlinesRef}
        args={[shardGeometry, shardOutlineMaterial, shardCount]}
        frustumCulled={false}
      />

      {/* Comic motion speedline streaks */}
      <instancedMesh
        ref={streaksRef}
        args={[streakGeometry, streakMaterial, streakCount]}
        frustumCulled={false}
      />

      {/* Distant Multiverse Collider Portal Rings */}
      <group ref={portalGroupRef} position={[2.5, 5.4, -22]} rotation={[0.15, -0.22, 0]}>
        <mesh>
          <torusGeometry args={[7.2, 0.12, 6, 8]} />
          <meshBasicMaterial color="#ff2d95" wireframe />
        </mesh>
        <mesh>
          <torusGeometry args={[5.5, 0.1, 6, 6]} />
          <meshBasicMaterial color="#00f0ff" wireframe />
        </mesh>
        <mesh>
          <torusGeometry args={[3.9, 0.08, 6, 12]} />
          <meshBasicMaterial color="#ffe600" wireframe />
        </mesh>
        <mesh>
          <torusGeometry args={[8.8, 0.07, 6, 10]} />
          <meshBasicMaterial color="#ff4d2e" wireframe transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Dual-tone comic perspective grid floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8.8, -8]}>
        <planeGeometry args={[130, 130, 34, 34]} />
        <meshBasicMaterial color="#ff2d95" wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
