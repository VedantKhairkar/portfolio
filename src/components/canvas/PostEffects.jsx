import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing';
import { BlendFunction, Effect } from 'postprocessing';
import * as THREE from 'three';

const GLITCH_SLICE_FRAGMENT = /* glsl */ `
  uniform float uIntensity;
  uniform float uTime;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    if (uIntensity <= 0.001) {
      outputColor = inputColor;
      return;
    }

    float steppedTime = floor(uTime * 18.0);
    float band = floor(uv.y * 18.0 + steppedTime * 0.37);
    float rnd = hash(band + steppedTime);
    float activeBand = step(0.38, rnd);
    float shift = (hash(band * 1.91 + steppedTime) - 0.5) * 0.22 * uIntensity * activeBand;

    float rgbSplit = (0.01 + 0.032 * activeBand) * uIntensity;
    vec2 uvR = vec2(clamp(uv.x + shift + rgbSplit, 0.0, 1.0), uv.y);
    vec2 uvG = vec2(clamp(uv.x + shift, 0.0, 1.0), uv.y);
    vec2 uvB = vec2(clamp(uv.x + shift - rgbSplit, 0.0, 1.0), uv.y);

    float r = texture2D(inputBuffer, uvR).r;
    float g = texture2D(inputBuffer, uvG).g;
    float b = texture2D(inputBuffer, uvB).b;

    float noise = (hash(dot(uv, vec2(12.9898, 78.233)) + steppedTime) - 0.5) * 0.14 * uIntensity;
    outputColor = vec4(r + noise, g + noise, b + noise, inputColor.a);
  }
`;

class GlitchSliceEffect extends Effect {
  constructor() {
    super('GlitchSliceEffect', GLITCH_SLICE_FRAGMENT, {
      uniforms: new Map([
        ['uIntensity', new THREE.Uniform(0)],
        ['uTime', new THREE.Uniform(0)],
      ]),
    });
  }
}

export default function PostEffects({ isMobile, reducedMotion, glitchIntensityRef }) {
  const aberrationOffset = useMemo(
    () => (reducedMotion ? new THREE.Vector2(0, 0) : new THREE.Vector2(0.0013, 0.0011)),
    [reducedMotion]
  );

  const glitchEffect = useMemo(() => new GlitchSliceEffect(), []);

  useEffect(() => {
    return () => {
      glitchEffect.dispose();
    };
  }, [glitchEffect]);

  useFrame((state) => {
    const intensity = reducedMotion ? 0 : glitchIntensityRef?.current || 0;
    glitchEffect.uniforms.get('uIntensity').value = intensity;
    glitchEffect.uniforms.get('uTime').value = state.clock.elapsedTime;
  });

  if (isMobile) {
    return null;
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.58}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.25}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={aberrationOffset}
      />
      <primitive object={glitchEffect} dispose={null} />
      <Vignette eskil={false} offset={0.2} darkness={0.58} />
    </EffectComposer>
  );
}
