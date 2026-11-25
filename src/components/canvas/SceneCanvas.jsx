import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import ParticleAccelerator from './ParticleAccelerator';
import CameraRig from './CameraRig';
import PostEffects from './PostEffects';

export default function SceneCanvas({
  activeSection,
  isMobile,
  reducedMotion,
  glitchIntensityRef,
  colliderEnergyRef,
}) {
  return (
    <div className="canvas-backdrop" aria-hidden="true">
      <Canvas
        dpr={isMobile ? [1, 1.25] : [1, 1.75]}
        camera={{ fov: isMobile ? 62 : 52, near: 0.1, far: 160, position: [0, 3, 24] }}
        gl={{ antialias: !isMobile, powerPreference: 'high-performance', alpha: true }}
      >
        <color attach="background" args={['#06001a']} />
        <fog attach="fog" args={['#08001e', 24, 60]} />

        <Suspense fallback={null}>
          <ParticleAccelerator
            isMobile={isMobile}
            reducedMotion={reducedMotion}
            energyRef={colliderEnergyRef}
          />
          <CameraRig
            activeSection={activeSection}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
          />
          <PostEffects
            isMobile={isMobile}
            reducedMotion={reducedMotion}
            glitchIntensityRef={glitchIntensityRef}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
