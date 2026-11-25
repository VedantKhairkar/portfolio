import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ON_TWOS_STEP = 1 / 12;

const ACCENT_PALETTE = [
  new THREE.Color('#ff2d95'),
  new THREE.Color('#00f0ff'),
  new THREE.Color('#ffe600'),
  new THREE.Color('#ff4d2e'),
  new THREE.Color('#39ff9c'),
];

function seededRandom(seed) {
  const x = Math.sin(seed * 91.3458) * 47453.5453;
  return x - Math.floor(x);
}

export default function SuperCollider({ isMobile, reducedMotion, colliderEnergy }) {
  // colliderEnergy: 0 = idle/rest (home), 0->1 = powering up during transition, 1 = full power

  const ringCount = isMobile ? 7 : 12;
  const arcCount = isMobile ? 18 : 42;
  const debrisCount = isMobile ? 24 : 55;
  const streakCount = isMobile ? 14 : 32;

  const ringsGroupRef = useRef(null);
  const arcsRef = useRef(null);
  const debrisRef = useRef(null);
  const streaksRef = useRef(null);
  const coreRef = useRef(null);
  const outerGlowRef = useRef(null);

  const accRef = useRef(0);
  const steppedTimeRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Ring materials with varied accent colors
  const ringMaterials = useMemo(() => {
    return ACCENT_PALETTE.map(
      (color) =>
        new THREE.MeshBasicMaterial({
          color,
          wireframe: true,
          transparent: true,
          opacity: 0.65,
        })
    );
  }, []);

  const arcGeometry = useMemo(() => new THREE.BoxGeometry(0.06, 0.06, 2.8), []);
  const arcMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.72,
      }),
    []
  );

  const debrisGeometry = useMemo(() => new THREE.OctahedronGeometry(0.35, 0), []);
  const debrisMaterial = useMemo(() => {
    const colors = new Float32Array(debrisCount * 3);
    for (let i = 0; i < debrisCount; i++) {
      const c = ACCENT_PALETTE[i % ACCENT_PALETTE.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geo = new THREE.OctahedronGeometry(0.35, 0);
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return { geo, mat: new THREE.MeshBasicMaterial({ vertexColors: false, color: '#ff2d95', transparent: true, opacity: 0.8 }) };
  }, [debrisCount]);

  const streakGeometry = useMemo(() => new THREE.BoxGeometry(0.04, 0.04, 4.5), []);
  const streakMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 }),
    []
  );

  // Ring configuration data
  const ringData = useMemo(() => {
    return Array.from({ length: ringCount }, (_, i) => {
      const baseRadius = 3.5 + i * 1.65;
      const tubeRadius = 0.06 + (i % 3) * 0.025;
      const segments = 6 + (i % 4) * 2;
      const radialSegments = 6 + (i % 3) * 4;
      const tiltX = (seededRandom(i + 10) - 0.5) * 1.4;
      const tiltY = (seededRandom(i + 30) - 0.5) * 1.4;
      const tiltZ = (seededRandom(i + 50) - 0.5) * 0.6;
      const speedMult = 0.3 + seededRandom(i + 70) * 1.2;
      const direction = i % 2 === 0 ? 1 : -1;
      const colorIdx = i % ACCENT_PALETTE.length;
      return { baseRadius, tubeRadius, segments, radialSegments, tiltX, tiltY, tiltZ, speedMult, direction, colorIdx };
    });
  }, [ringCount]);

  // Energy arc data (beams connecting rings)
  const arcData = useMemo(() => {
    return Array.from({ length: arcCount }, (_, i) => {
      const angle = (i / arcCount) * Math.PI * 2;
      const radius = 2.5 + seededRandom(i + 200) * 12.0;
      const y = (seededRandom(i + 220) - 0.5) * 6.0;
      const speed = 0.5 + seededRandom(i + 240) * 1.5;
      const phase = seededRandom(i + 260) * Math.PI * 2;
      const length = 1.8 + seededRandom(i + 280) * 3.5;
      return { angle, radius, y, speed, phase, length };
    });
  }, [arcCount]);

  // Debris shards orbiting the collider
  const debrisData = useMemo(() => {
    return Array.from({ length: debrisCount }, (_, i) => {
      const orbitRadius = 4.0 + seededRandom(i + 400) * 14.0;
      const orbitSpeed = 0.25 + seededRandom(i + 420) * 0.9;
      const phase = seededRandom(i + 440) * Math.PI * 2;
      const y = (seededRandom(i + 460) - 0.5) * 10.0;
      const yBob = 0.3 + seededRandom(i + 480) * 0.7;
      const scale = 0.2 + seededRandom(i + 500) * 0.55;
      const spinSpeed = 0.6 + seededRandom(i + 520) * 1.2;
      return { orbitRadius, orbitSpeed, phase, y, yBob, scale, spinSpeed };
    });
  }, [debrisCount]);

  // Speed streaks
  const streakData = useMemo(() => {
    return Array.from({ length: streakCount }, (_, i) => ({
      x: (seededRandom(i + 700) - 0.5) * 32,
      y: (seededRandom(i + 720) - 0.5) * 18,
      zStart: -28 + seededRandom(i + 740) * 36,
      speed: 5.0 + seededRandom(i + 760) * 8.0,
      color: ACCENT_PALETTE[i % ACCENT_PALETTE.length],
    }));
  }, [streakCount]);

  const applyTransforms = (t, energy) => {
    // Energy drives how fast and bright everything is
    // 0 = barely moving (rest state), 1 = full power
    const idleSpeed = 0.08;
    const speedFactor = idleSpeed + energy * (1.0 - idleSpeed);
    const effectiveTime = t * speedFactor;

    // Rotate rings based on energy
    if (ringsGroupRef.current) {
      const rings = ringsGroupRef.current.children;
      for (let i = 0; i < rings.length && i < ringData.length; i++) {
        const rd = ringData[i];
        const spin = effectiveTime * rd.speedMult * rd.direction;
        rings[i].rotation.x = rd.tiltX + spin * 0.7;
        rings[i].rotation.y = rd.tiltY + spin;
        rings[i].rotation.z = rd.tiltZ + spin * 0.3;

        // Rings pulse brighter with energy
        const mat = rings[i].material;
        if (mat) {
          mat.opacity = 0.35 + energy * 0.5;
        }
      }
    }

    // Energy arcs — only visible when energy > 0.15
    const arcMesh = arcsRef.current;
    if (arcMesh) {
      const arcOpacity = Math.max(0, (energy - 0.15) * 1.2);
      arcMaterial.opacity = arcOpacity * 0.75;

      for (let i = 0; i < arcData.length; i++) {
        const a = arcData[i];
        const angle = a.angle + effectiveTime * a.speed;
        const r = a.radius * (0.85 + energy * 0.15);
        dummy.position.set(
          Math.cos(angle) * r,
          a.y + Math.sin(effectiveTime * 1.5 + a.phase) * 1.5 * energy,
          Math.sin(angle) * r
        );
        // Point arcs toward the center
        dummy.lookAt(0, 0, 0);
        dummy.scale.set(1, 1, 0.5 + energy * a.length / 2.8);
        dummy.updateMatrix();
        arcMesh.setMatrixAt(i, dummy.matrix);
      }
      arcMesh.instanceMatrix.needsUpdate = true;
    }

    // Orbiting debris
    const debrisMesh = debrisRef.current;
    if (debrisMesh) {
      for (let i = 0; i < debrisData.length; i++) {
        const d = debrisData[i];
        const orbitAngle = d.phase + effectiveTime * d.orbitSpeed;
        const r = d.orbitRadius * (0.9 + energy * 0.1);
        const bobOffset = reducedMotion ? 0 : Math.sin(effectiveTime * 0.8 + d.phase) * d.yBob * (0.3 + energy * 0.7);
        dummy.position.set(
          Math.cos(orbitAngle) * r,
          d.y + bobOffset,
          Math.sin(orbitAngle) * r
        );
        const spin = reducedMotion ? d.phase : effectiveTime * d.spinSpeed;
        dummy.rotation.set(spin * 0.7, spin, spin * 0.4);
        dummy.scale.setScalar(d.scale * (0.6 + energy * 0.4));
        dummy.updateMatrix();
        debrisMesh.setMatrixAt(i, dummy.matrix);
        debrisMesh.setColorAt(i, ACCENT_PALETTE[i % ACCENT_PALETTE.length]);
      }
      debrisMesh.instanceMatrix.needsUpdate = true;
      if (debrisMesh.instanceColor) debrisMesh.instanceColor.needsUpdate = true;
    }

    // Speed streaks — visible at higher energy
    const stMesh = streaksRef.current;
    if (stMesh) {
      streakMaterial.opacity = energy * 0.6;
      for (let i = 0; i < streakData.length; i++) {
        const st = streakData[i];
        const zSpan = 36;
        const z = reducedMotion
          ? st.zStart
          : ((st.zStart + t * st.speed * energy + 28) % zSpan) - 28;
        dummy.position.set(st.x, st.y, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1 + energy * 0.5, 1 + energy * 0.5, 1 + energy * 2.0);
        dummy.updateMatrix();
        stMesh.setMatrixAt(i, dummy.matrix);
        stMesh.setColorAt(i, st.color);
      }
      stMesh.instanceMatrix.needsUpdate = true;
      if (stMesh.instanceColor) stMesh.instanceColor.needsUpdate = true;
    }

    // Central core glow
    if (coreRef.current) {
      const coreScale = 0.4 + energy * 1.8;
      coreRef.current.scale.setScalar(coreScale);
      coreRef.current.material.opacity = 0.15 + energy * 0.55;
      if (!reducedMotion) {
        coreRef.current.rotation.z = effectiveTime * 2.5;
      }
    }

    // Outer glow halo
    if (outerGlowRef.current) {
      const glowScale = 2.0 + energy * 6.0;
      outerGlowRef.current.scale.setScalar(glowScale);
      outerGlowRef.current.material.opacity = energy * 0.25;
    }
  };

  useEffect(() => {
    applyTransforms(0, 0);
    return () => {
      ringMaterials.forEach((m) => m.dispose());
      arcGeometry.dispose();
      arcMaterial.dispose();
      debrisMaterial.geo.dispose();
      debrisMaterial.mat.dispose();
      streakGeometry.dispose();
      streakMaterial.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    accRef.current += Math.min(delta, 0.1);
    if (reducedMotion) {
      // Still update but no stepping
      steppedTimeRef.current += Math.min(delta, 0.1);
      applyTransforms(steppedTimeRef.current, colliderEnergy?.current ?? 0);
      return;
    }
    if (accRef.current < ON_TWOS_STEP) return;

    const steps = Math.floor(accRef.current / ON_TWOS_STEP);
    accRef.current -= steps * ON_TWOS_STEP;
    steppedTimeRef.current += steps * ON_TWOS_STEP;

    applyTransforms(steppedTimeRef.current, colliderEnergy?.current ?? 0);
  });

  return (
    <group position={[0, 1.5, -8]}>
      {/* Central Energy Core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshBasicMaterial color="#ffe600" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Outer Glow Halo */}
      <mesh ref={outerGlowRef}>
        <ringGeometry args={[0.8, 1.0, 32]} />
        <meshBasicMaterial color="#ff2d95" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Concentric Collider Rings */}
      <group ref={ringsGroupRef}>
        {ringData.map((rd, i) => (
          <mesh key={i} rotation={[rd.tiltX, rd.tiltY, rd.tiltZ]}>
            <torusGeometry args={[rd.baseRadius, rd.tubeRadius, rd.radialSegments, rd.segments]} />
            <meshBasicMaterial
              color={ACCENT_PALETTE[rd.colorIdx]}
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>
        ))}
      </group>

      {/* Energy Arc Beams */}
      <instancedMesh
        ref={arcsRef}
        args={[arcGeometry, arcMaterial, arcCount]}
        frustumCulled={false}
      />

      {/* Orbiting Dimensional Debris */}
      <instancedMesh
        ref={debrisRef}
        args={[debrisMaterial.geo, debrisMaterial.mat, debrisCount]}
        frustumCulled={false}
      />

      {/* Speed Streaks */}
      <instancedMesh
        ref={streaksRef}
        args={[streakGeometry, streakMaterial, streakCount]}
        frustumCulled={false}
      />

      {/* Perspective Grid Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
        <planeGeometry args={[140, 140, 36, 36]} />
        <meshBasicMaterial color="#ff2d95" wireframe transparent opacity={0.18} />
      </mesh>
    </group>
  );
}
