import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { PanelHoverGlitchFilter } from './GlitchContainer';

export default function GlitchTransition({
  transitionId,
  active,
  reducedMotion,
  glitchIntensityRef,
  onMidpoint,
  onComplete,
}) {
  const flashRef = useRef(null);
  const turbRef = useRef(null);
  const dispRef = useRef(null);

  useEffect(() => {
    if (!active || reducedMotion || transitionId === 0) return undefined;

    const flashEl = flashRef.current;
    const turbEl = turbRef.current;
    const dispEl = dispRef.current;
    const viewport = document.querySelector('.section-viewport');

    let swapped = false;
    const stateObj = { glitch: 0, disp: 0, seed: 2 };

    const applyDisp = () => {
      if (dispEl) dispEl.setAttribute('scale', String(Math.round(stateObj.disp)));
      if (turbEl) turbEl.setAttribute('seed', String(Math.round(stateObj.seed)));
      if (glitchIntensityRef) {
        glitchIntensityRef.current = stateObj.glitch;
      }
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onUpdate: applyDisp,
        onComplete: () => {
          stateObj.glitch = 0;
          stateObj.disp = 0;
          applyDisp();
          if (viewport) {
            gsap.set(viewport, { clearProps: 'transform,clipPath,opacity' });
          }
          if (flashEl) {
            gsap.set(flashEl, { autoAlpha: 0 });
          }
          onComplete?.();
        },
      });

      // Phase 1 (0 -> 0.24s): Screen & 3D scene tear horizontally with RGB split
      tl.to(stateObj, {
        glitch: 1,
        disp: 68,
        seed: 7,
        duration: 0.14,
        ease: 'steps(3)',
      })
        .to(
          viewport,
          {
            x: -16,
            skewX: -3,
            duration: 0.08,
            ease: 'steps(1)',
          },
          0.02
        )
        .to(
          viewport,
          {
            x: 18,
            skewX: 4,
            duration: 0.08,
            ease: 'steps(1)',
          },
          0.1
        )
        .to(
          flashEl,
          {
            autoAlpha: 0.36,
            duration: 0.09,
            ease: 'steps(2)',
          },
          0.12
        )
        // Midpoint (~0.24s): Swap to next section underneath the peak slice tear
        .add(() => {
          if (!swapped) {
            swapped = true;
            onMidpoint?.();
          }
        }, 0.24)
        // Phase 2 (0.26 -> 0.60s): Incoming section snaps in from horizontal RGB slice burst
        .to(
          stateObj,
          {
            glitch: 0.78,
            disp: -58,
            seed: 13,
            duration: 0.12,
            ease: 'steps(2)',
          },
          0.25
        )
        .to(
          viewport,
          {
            x: -10,
            skewX: 2,
            duration: 0.09,
            ease: 'steps(1)',
          },
          0.26
        )
        .to(
          flashEl,
          {
            autoAlpha: 0,
            duration: 0.18,
            ease: 'power2.out',
          },
          0.26
        )
        .to(
          stateObj,
          {
            glitch: 0,
            disp: 0,
            seed: 1,
            duration: 0.21,
            ease: 'steps(3)',
          },
          0.38
        )
        .to(
          viewport,
          {
            x: 0,
            skewX: 0,
            duration: 0.2,
            ease: 'steps(2)',
          },
          0.38
        );
    });

    return () => {
      ctx.revert();
      stateObj.glitch = 0;
      stateObj.disp = 0;
      applyDisp();
    };
  }, [active, transitionId, reducedMotion, glitchIntensityRef, onMidpoint, onComplete]);

  if (reducedMotion) return null;

  return (
    <>
      <PanelHoverGlitchFilter />

      <svg
        aria-hidden="true"
        style={{ position: 'fixed', width: 0, height: 0, pointerEvents: 'none' }}
      >
        <defs>
          <filter id="ui-glitch-slice" x="-15%" y="-5%" width="130%" height="110%">
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.001 0.16"
              numOctaves="1"
              seed="2"
              result="noise"
            />
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div
        ref={flashRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          pointerEvents: 'none',
          opacity: 0,
          visibility: 'hidden',
          mixBlendMode: 'screen',
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,240,255,0.24) 0px, rgba(0,240,255,0.24) 2px, transparent 2px, transparent 14px, rgba(255,45,149,0.24) 14px, rgba(255,45,149,0.24) 17px, transparent 17px, transparent 34px), radial-gradient(rgba(255,230,0,0.22) 1px, transparent 1px)',
          backgroundSize: '100% 34px, 8px 8px',
        }}
      />
    </>
  );
}
