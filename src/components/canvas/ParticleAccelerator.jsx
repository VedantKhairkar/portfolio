import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ON_TWOS_STEP = 1 / 12;

const PALETTE = {
  magenta: new THREE.Color('#ff2d95'),
  cyan: new THREE.Color('#00f0ff'),
  yellow: new THREE.Color('#ffe600'),
  coral: new THREE.Color('#ff4d2e'),
  mint: new THREE.Color('#39ff9c'),
  white: new THREE.Color('#ffffff'),
};

const BEAM_COLORS = [PALETTE.magenta, PALETTE.cyan, PALETTE.yellow, PALETTE.coral, PALETTE.mint];

function seededRandom(seed) {
  const x = Math.sin(seed * 91.3458) * 47453.5453;
  return x - Math.floor(x);
}

export default function ParticleAccelerator({ isMobile, reducedMotion, energyRef }) {
  // energyRef.current: 0 = fully at rest, 1 = full power

  const trackCount = isMobile ? 5 : 8;
  const particleCount = isMobile ? 60 : 140;
  const sparkCount = isMobile ? 20 : 50;
  const debrisCount = isMobile ? 16 : 36;

  const tracksGroupRef = useRef(null);
  const particlesRef = useRef(null);
  const sparksRef = useRef(null);
  const debrisRef = useRef(null);
  const coreRef = useRef(null);
  const beamGroupRef = useRef(null);
  const detectorGroupRef = useRef(null);

  const accRef = useRef(0);
  const steppedTimeRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Particle material: simple glowing dots
  const particleGeo = useMemo(() => new THREE.SphereGeometry(0.12, 6, 4), []);
  const particleMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.95 }),
    []
  );

  const sparkGeo = useMemo(() => new THREE.SphereGeometry(0.06, 4, 3), []);
  const sparkMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffe600', transparent: true, opacity: 0.7 }),
    []
  );

  const debrisGeo = useMemo(() => new THREE.OctahedronGeometry(0.28, 0), []);
  const debrisMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ff2d95', transparent: true, opacity: 0.72 }),
    []
  );

  // Track configuration: nested circular beam pipes at different tilts
  const trackData = useMemo(() => {
    return Array.from({ length: trackCount }, (_, i) => {
      const radius = 5.0 + i * 2.2;
      const tiltX = (seededRandom(i + 10) - 0.5) * 0.9;
      const tiltY = (seededRandom(i + 30) - 0.5) * 0.9;
      const tiltZ = (seededRandom(i + 50) - 0.5) * 0.4;
      const direction = i % 2 === 0 ? 1 : -1;
      const speedMult = 0.15 + seededRandom(i + 70) * 0.6;
      const colorIdx = i % BEAM_COLORS.length;
      return { radius, tiltX, tiltY, tiltZ, direction, speedMult, colorIdx };
    });
  }, [trackCount]);

  // Particle data: each particle orbits a specific track
  const particleData = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const trackIdx = i % trackCount;
      const track = trackData[trackIdx];
      const phase = (i / particleCount) * Math.PI * 2 + seededRandom(i + 100) * 0.8;
      const orbitSpeed = 0.8 + seededRandom(i + 120) * 2.2;
      const wobble = seededRandom(i + 140) * 0.35;
      const colorIdx = i % BEAM_COLORS.length;
      return { trackIdx, phase, orbitSpeed, wobble, colorIdx, radius: track.radius };
    });
  }, [particleCount, trackCount, trackData]);

  // Collision sparks: burst outward from center at high energy
  const sparkData = useMemo(() => {
    return Array.from({ length: sparkCount }, (_, i) => ({
      dirX: (seededRandom(i + 300) - 0.5) * 2,
      dirY: (seededRandom(i + 320) - 0.5) * 2,
      dirZ: (seededRandom(i + 340) - 0.5) * 2,
      speed: 2.0 + seededRandom(i + 360) * 5.0,
      phase: seededRandom(i + 380) * Math.PI * 2,
      life: 0.5 + seededRandom(i + 400) * 1.5,
    }));
  }, [sparkCount]);

  // Floating debris chunks
  const debrisData = useMemo(() => {
    return Array.from({ length: debrisCount }, (_, i) => ({
      orbitRadius: 6.0 + seededRandom(i + 500) * 16.0,
      orbitSpeed: 0.12 + seededRandom(i + 520) * 0.4,
      phase: seededRandom(i + 540) * Math.PI * 2,
      y: (seededRandom(i + 560) - 0.5) * 12.0,
      yBob: 0.2 + seededRandom(i + 580) * 0.6,
      scale: 0.15 + seededRandom(i + 600) * 0.45,
      spinSpeed: 0.4 + seededRandom(i + 620) * 1.0,
    }));
  }, [debrisCount]);

  const applyTransforms = (t, energy) => {
    const idleSpeed = 0.04;
    const speedFactor = idleSpeed + energy * (1.0 - idleSpeed);

    // Rotate tracks
    if (tracksGroupRef.current) {
      const tracks = tracksGroupRef.current.children;
      for (let i = 0; i < tracks.length && i < trackData.length; i++) {
        const td = trackData[i];
        const spin = t * speedFactor * td.speedMult * td.direction;
        tracks[i].rotation.x = td.tiltX + spin * 0.5;
        tracks[i].rotation.y = td.tiltY + spin;
        tracks[i].rotation.z = td.tiltZ + spin * 0.25;
        if (tracks[i].material) {
          tracks[i].material.opacity = 0.22 + energy * 0.45;
        }
      }
    }

    // Particles racing around tracks
    const pMesh = particlesRef.current;
    if (pMesh) {
      particleMat.opacity = 0.3 + energy * 0.7;
      for (let i = 0; i < particleData.length; i++) {
        const p = particleData[i];
        const td = trackData[p.trackIdx];
        const angle = p.phase + t * p.orbitSpeed * speedFactor * td.direction;
        const r = p.radius + Math.sin(t * 2.5 + p.phase) * p.wobble * energy;

        // Transform particle position into the track's tilted plane
        const localX = Math.cos(angle) * r;
        const localY = Math.sin(angle) * r;

        // Apply track tilt rotation
        const cx = Math.cos(td.tiltX), sx = Math.sin(td.tiltX);
        const cy = Math.cos(td.tiltY), sy = Math.sin(td.tiltY);
        const cz = Math.cos(td.tiltZ), sz = Math.sin(td.tiltZ);

        let px = localX;
        let py = localY;
        let pz = 0;

        // Rotate around Z
        let nx = px * cz - py * sz;
        let ny = px * sz + py * cz;
        px = nx; py = ny;

        // Rotate around X
        let ny2 = py * cx - pz * sx;
        let nz2 = py * sx + pz * cx;
        py = ny2; pz = nz2;

        // Rotate around Y
        let nx2 = px * cy + pz * sy;
        let nz3 = -px * sy + pz * cy;
        px = nx2; pz = nz3;

        dummy.position.set(px, py, pz);
        const s = 0.3 + energy * 0.8;
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        pMesh.setMatrixAt(i, dummy.matrix);
        pMesh.setColorAt(i, BEAM_COLORS[p.colorIdx]);
      }
      pMesh.instanceMatrix.needsUpdate = true;
      if (pMesh.instanceColor) pMesh.instanceColor.needsUpdate = true;
    }

    // Collision sparks — radiate from center at high energy
    const sMesh = sparksRef.current;
    if (sMesh) {
      sparkMat.opacity = energy > 0.3 ? (energy - 0.3) * 1.4 * 0.75 : 0;
      for (let i = 0; i < sparkData.length; i++) {
        const sp = sparkData[i];
        const cycleT = ((t * sp.speed + sp.phase) % sp.life) / sp.life;
        const dist = cycleT * (3.0 + energy * 8.0);
        dummy.position.set(sp.dirX * dist, sp.dirY * dist, sp.dirZ * dist);
        dummy.scale.setScalar(0.5 + (1 - cycleT) * energy * 1.5);
        dummy.updateMatrix();
        sMesh.setMatrixAt(i, dummy.matrix);
        sMesh.setColorAt(i, BEAM_COLORS[i % BEAM_COLORS.length]);
      }
      sMesh.instanceMatrix.needsUpdate = true;
      if (sMesh.instanceColor) sMesh.instanceColor.needsUpdate = true;
    }

    // Orbiting debris
    const dMesh = debrisRef.current;
    if (dMesh) {
      debrisMat.opacity = 0.35 + energy * 0.45;
      for (let i = 0; i < debrisData.length; i++) {
        const d = debrisData[i];
        const orbitAngle = d.phase + t * d.orbitSpeed * speedFactor;
        const bobOffset = reducedMotion ? 0 : Math.sin(t * 0.6 + d.phase) * d.yBob * (0.3 + energy * 0.7);
        dummy.position.set(
          Math.cos(orbitAngle) * d.orbitRadius,
          d.y + bobOffset,
          Math.sin(orbitAngle) * d.orbitRadius
        );
        const spin = reducedMotion ? d.phase : t * d.spinSpeed * speedFactor;
        dummy.rotation.set(spin * 0.7, spin, spin * 0.4);
        dummy.scale.setScalar(d.scale * (0.5 + energy * 0.5));
        dummy.updateMatrix();
        dMesh.setMatrixAt(i, dummy.matrix);
        dMesh.setColorAt(i, BEAM_COLORS[i % BEAM_COLORS.length]);
      }
      dMesh.instanceMatrix.needsUpdate = true;
      if (dMesh.instanceColor) dMesh.instanceColor.needsUpdate = true;
    }

    // Central collision core
    if (coreRef.current) {
      const coreScale = 0.3 + energy * 2.2;
      coreRef.current.scale.setScalar(coreScale);
      coreRef.current.material.opacity = 0.08 + energy * 0.6;
      if (!reducedMotion) {
        coreRef.current.rotation.x = t * 0.4 * speedFactor;
        coreRef.current.rotation.z = t * 0.6 * speedFactor;
      }
    }

    // Central beam pillars (vertical energy beams at collision point)
    if (beamGroupRef.current) {
      const beams = beamGroupRef.current.children;
      for (let i = 0; i < beams.length; i++) {
        const beamScale = energy > 0.2 ? (energy - 0.2) * 1.25 : 0;
        beams[i].scale.set(0.5 + energy * 0.5, beamScale * 14, 0.5 + energy * 0.5);
        if (beams[i].material) {
          beams[i].material.opacity = beamScale * 0.55;
        }
      }
    }

    // Detector housings pulse
    if (detectorGroupRef.current) {
      const dets = detectorGroupRef.current.children;
      for (let i = 0; i < dets.length; i++) {
        const pulse = 0.8 + Math.sin(t * 2.5 + i * 1.5) * 0.2 * energy;
        dets[i].scale.setScalar(pulse);
        if (dets[i].material) {
          dets[i].material.opacity = 0.2 + energy * 0.42;
        }
      }
    }
  };

  useEffect(() => {
    applyTransforms(0, 0);
    return () => {
      particleGeo.dispose();
      particleMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      debrisGeo.dispose();
      debrisMat.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    const energy = energyRef?.current ?? 0;
    accRef.current += Math.min(delta, 0.1);
    if (reducedMotion) {
      steppedTimeRef.current += Math.min(delta, 0.1);
      applyTransforms(steppedTimeRef.current, energy);
      return;
    }
    if (accRef.current < ON_TWOS_STEP) return;
    const steps = Math.floor(accRef.current / ON_TWOS_STEP);
    accRef.current -= steps * ON_TWOS_STEP;
    steppedTimeRef.current += steps * ON_TWOS_STEP;
    applyTransforms(steppedTimeRef.current, energy);
  });

  return (
    <group position={[0, 1.0, -8]}>
      {/* Central Collision Core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.0, 2]} />
        <meshBasicMaterial color="#ffe600" wireframe transparent opacity={0.08} />
      </mesh>

      {/* Vertical Collision Energy Beams */}
      <group ref={beamGroupRef}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1, 6]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 3]}>
          <cylinderGeometry args={[0.06, 0.06, 1, 6]} />
          <meshBasicMaterial color="#ff2d95" transparent opacity={0} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 3]}>
          <cylinderGeometry args={[0.06, 0.06, 1, 6]} />
          <meshBasicMaterial color="#ffe600" transparent opacity={0} />
        </mesh>
      </group>

      {/* Detector Chambers at cardinal points */}
      <group ref={detectorGroupRef}>
        {[
          [12, 0, 0],
          [-12, 0, 0],
          [0, 0, 12],
          [0, 0, -12],
        ].map((pos, i) => (
          <mesh key={i} position={pos}>
            <boxGeometry args={[2.4, 2.4, 2.4]} />
            <meshBasicMaterial
              color={BEAM_COLORS[i % BEAM_COLORS.length]}
              wireframe
              transparent
              opacity={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Acceleration Track Rings (beam pipes) */}
      <group ref={tracksGroupRef}>
        {trackData.map((td, i) => (
          <mesh key={i} rotation={[td.tiltX, td.tiltY, td.tiltZ]}>
            <torusGeometry args={[td.radius, 0.065 + (i % 3) * 0.02, 8, 48 + i * 6]} />
            <meshBasicMaterial
              color={BEAM_COLORS[td.colorIdx]}
              wireframe
              transparent
              opacity={0.22}
            />
          </mesh>
        ))}
      </group>

      {/* Accelerating Particles */}
      <instancedMesh
        ref={particlesRef}
        args={[particleGeo, particleMat, particleCount]}
        frustumCulled={false}
      />

      {/* Collision Sparks */}
      <instancedMesh
        ref={sparksRef}
        args={[sparkGeo, sparkMat, sparkCount]}
        frustumCulled={false}
      />

      {/* Orbiting Debris */}
      <instancedMesh
        ref={debrisRef}
        args={[debrisGeo, debrisMat, debrisCount]}
        frustumCulled={false}
      />

      {/* Perspective Grid Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
        <planeGeometry args={[140, 140, 36, 36]} />
        <meshBasicMaterial color="#ff2d95" wireframe transparent opacity={0.16} />
      </mesh>
    </group>
  );
}
