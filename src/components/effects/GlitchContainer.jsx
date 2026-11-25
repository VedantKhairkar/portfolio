import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

let activePanelFilterController = null;

export function registerPanelFilterController(fn) {
  activePanelFilterController = fn;
  return () => {
    if (activePanelFilterController === fn) {
      activePanelFilterController = null;
    }
  };
}

export default function GlitchContainer({
  as: Tag = 'div',
  children,
  className = '',
  style = {},
  reducedMotion = false,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  ...rest
}) {
  const [bursting, setBursting] = useState(false);
  const timerRef = useRef(null);

  const triggerBurst = useCallback(() => {
    if (reducedMotion) return;
    setBursting(true);
    activePanelFilterController?.();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setBursting(false);
    }, 380);
  }, [reducedMotion]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleEnter = (event) => {
    triggerBurst();
    onMouseEnter?.(event);
  };

  return (
    <Tag
      {...rest}
      onMouseEnter={handleEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`comic-glitch-panel ${bursting ? 'is-bursting' : ''} ${className}`}
      style={style}
    >
      {children}
      {/* Brief corner glitch telemetry tag visible during burst */}
      {!reducedMotion && bursting && (
        <span
          aria-hidden="true"
          className="font-mono-tag"
          style={{
            position: 'absolute',
            top: '6px',
            right: '8px',
            zIndex: 12,
            background: '#ff4d2e',
            color: '#ffe600',
            border: '2px solid #05050a',
            padding: '0.05rem 0.35rem',
            fontSize: '0.62rem',
            fontWeight: 700,
            pointerEvents: 'none',
            boxShadow: '-2px 0 0 #00f0ff, 2px 0 0 #ff2d95',
          }}
        >
          GLITCH // 12FPS
        </span>
      )}
    </Tag>
  );
}

export function PanelHoverGlitchFilter() {
  const turbRef = useRef(null);
  const dispRef = useRef(null);

  useEffect(() => {
    const trigger = () => {
      const turb = turbRef.current;
      const disp = dispRef.current;
      if (!turb || !disp) return;

      const state = { scale: 26, seed: 3 };
      gsap.killTweensOf(state);
      gsap.to(state, {
        scale: 0,
        seed: 17,
        duration: 0.36,
        ease: 'steps(4)',
        onUpdate: () => {
          disp.setAttribute('scale', String(Math.round(state.scale)));
          turb.setAttribute('seed', String(Math.round(state.seed)));
        },
        onComplete: () => {
          disp.setAttribute('scale', '0');
        },
      });
    };

    return registerPanelFilterController(trigger);
  }, []);

  return (
    <svg
      aria-hidden="true"
      style={{ position: 'fixed', width: 0, height: 0, pointerEvents: 'none' }}
    >
      <defs>
        <filter id="panel-hover-slice" x="-8%" y="-4%" width="116%" height="108%">
          <feTurbulence
            ref={turbRef}
            type="fractalNoise"
            baseFrequency="0.002 0.24"
            numOctaves="1"
            seed="3"
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
  );
}
