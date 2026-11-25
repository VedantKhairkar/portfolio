import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';

// Landing: wide cinematic overview of the dormant accelerator
// Home onward: camera pushes in through / around the structure
const CAMERA_VANTAGES = {
  landing:  { pos: [0,   3.5, 28],   target: [0,  1.0, -8],  roll: 0 },
  home:     { pos: [0,   3.0, 20],   target: [0,  1.5, -8],  roll: -0.02 },
  about:    { pos: [-10, 6.0, 12],   target: [-1, 2.0, -8],  roll: 0.045 },
  projects: { pos: [10,  2.0, 7],    target: [1,  2.0, -8],  roll: -0.055 },
  contact:  { pos: [0,  11.5, 13],   target: [0,  1.5, -8],  roll: 0.025 },
};

export default function CameraRig({ activeSection, isMobile, reducedMotion }) {
  const { camera } = useThree();
  const basePosRef = useRef(new THREE.Vector3(...CAMERA_VANTAGES.landing.pos));
  const lookTargetRef = useRef(new THREE.Vector3(...CAMERA_VANTAGES.landing.target));
  const rollRef = useRef({ value: 0 });
  const pointerOffsetRef = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const vantage = CAMERA_VANTAGES[activeSection] || CAMERA_VANTAGES.landing;
    const duration = reducedMotion ? 0 : 1.1;

    gsap.killTweensOf(basePosRef.current);
    gsap.killTweensOf(lookTargetRef.current);
    gsap.killTweensOf(rollRef.current);

    if (duration === 0) {
      basePosRef.current.set(...vantage.pos);
      lookTargetRef.current.set(...vantage.target);
      rollRef.current.value = 0;
      return;
    }

    gsap.to(basePosRef.current, {
      x: vantage.pos[0],
      y: vantage.pos[1],
      z: vantage.pos[2],
      duration,
      ease: 'power3.inOut',
    });

    gsap.to(lookTargetRef.current, {
      x: vantage.target[0],
      y: vantage.target[1],
      z: vantage.target[2],
      duration,
      ease: 'power3.inOut',
    });

    gsap.to(rollRef.current, {
      value: vantage.roll,
      duration,
      ease: 'power2.inOut',
    });
  }, [activeSection, reducedMotion]);

  useFrame((state, delta) => {
    const parallaxScale = reducedMotion || isMobile ? 0 : 1;
    const targetX = state.pointer.x * 2.5 * parallaxScale;
    const targetY = state.pointer.y * 1.3 * parallaxScale;

    const damping = 1 - Math.exp(-4.5 * Math.min(delta, 0.1));
    pointerOffsetRef.current.x = THREE.MathUtils.lerp(pointerOffsetRef.current.x, targetX, damping);
    pointerOffsetRef.current.y = THREE.MathUtils.lerp(pointerOffsetRef.current.y, targetY, damping);

    camera.position.set(
      basePosRef.current.x + pointerOffsetRef.current.x,
      basePosRef.current.y + pointerOffsetRef.current.y,
      basePosRef.current.z
    );
    camera.lookAt(lookTargetRef.current);
    if (!reducedMotion && !isMobile) {
      camera.rotation.z += rollRef.current.value;
    }
  });

  return null;
}
