import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SceneCanvas from './components/canvas/SceneCanvas';
import HalftoneOverlay from './components/effects/HalftoneOverlay';
import GlitchTransition from './components/effects/GlitchTransition';
import Navbar from './components/layout/Navbar';
import SectionWrapper from './components/layout/SectionWrapper';
import HomeSection from './components/sections/HomeSection';
import AboutSection from './components/sections/AboutSection';
import ProjectsSection from './components/sections/ProjectsSection';
import ContactSection from './components/sections/ContactSection';
import { SECTIONS } from './data/portfolioData';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useIsMobile } from './hooks/useIsMobile';
import { useSectionNavigation } from './hooks/useSectionNavigation';

export default function App() {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const wheelLockRef = useRef(0);
  const glitchIntensityRef = useRef(0);
  const colliderEnergyRef = useRef(0);

  const {
    activeSection,
    transitionState,
    targetEnergy,
    navigateTo,
    stepSection,
    handleMidpointSwap,
    handleTransitionComplete,
  } = useSectionNavigation(reducedMotion);

  // Smoothly animate collider energy toward target when section changes
  useEffect(() => {
    const duration = reducedMotion ? 0 : 0.85;
    const obj = { val: colliderEnergyRef.current };
    gsap.killTweensOf(obj);
    if (duration === 0) {
      colliderEnergyRef.current = targetEnergy;
      return;
    }
    gsap.to(obj, {
      val: targetEnergy,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        colliderEnergyRef.current = obj.val;
      },
    });
  }, [targetEnergy, reducedMotion]);

  // Keyboard arrow & wheel navigation with infinite loop wrapping
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        stepSection(1);
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        stepSection(-1);
      }
    };

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) < 35) return;
      const now = Date.now();
      if (now - wheelLockRef.current < 850) return;

      const scroller = document.querySelector('.section-scroll');
      if (scroller) {
        const atTop = scroller.scrollTop <= 2;
        const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
        if (event.deltaY > 0 && !atBottom) return;
        if (event.deltaY < 0 && !atTop) return;
      }

      wheelLockRef.current = now;
      stepSection(event.deltaY > 0 ? 1 : -1);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('wheel', onWheel);
    };
  }, [stepSection]);

  const renderSection = () => {
    switch (activeSection) {
      case 'about':
        return <AboutSection reducedMotion={reducedMotion} />;
      case 'projects':
        return <ProjectsSection reducedMotion={reducedMotion} isMobile={isMobile} />;
      case 'contact':
        return <ContactSection reducedMotion={reducedMotion} />;
      case 'home':
      default:
        return <HomeSection onNavigate={navigateTo} reducedMotion={reducedMotion} />;
    }
  };

  return (
    <div className="app-shell">
      <SceneCanvas
        activeSection={activeSection}
        isMobile={isMobile}
        reducedMotion={reducedMotion}
        glitchIntensityRef={glitchIntensityRef}
        colliderEnergyRef={colliderEnergyRef}
      />

      <HalftoneOverlay />

      <div className={`ui-layer ${transitionState.active && !reducedMotion ? 'is-glitching' : ''}`}>
        <Navbar
          activeSection={activeSection}
          onNavigate={navigateTo}
          reducedMotion={reducedMotion}
        />

        <SectionWrapper label={`${activeSection} section`}>
          {renderSection()}
        </SectionWrapper>

        {/* District progress rail with loop indicator */}
        {!isMobile && (
          <aside
            aria-label="District progress rail"
            style={{
              position: 'fixed',
              right: '1.15rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 25,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.55rem',
            }}
          >
            {SECTIONS.map((sec) => {
              const active = sec.id === activeSection;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => navigateTo(sec.id)}
                  title={`${sec.label} (#${sec.issue})`}
                  aria-label={`Warp to ${sec.label}`}
                  style={{
                    width: active ? '18px' : '12px',
                    height: active ? '28px' : '12px',
                    background: active ? '#ffe600' : 'rgba(13, 0, 44, 0.85)',
                    border: '2.5px solid #05050a',
                    boxShadow: active ? '2px 2px 0 #ff2d95' : '2px 2px 0 #00f0ff',
                    cursor: 'pointer',
                    padding: 0,
                    alignSelf: 'center',
                  }}
                />
              );
            })}
            {/* Loop indicator */}
            <span
              className="font-mono-tag"
              style={{
                fontSize: '0.6rem',
                color: '#39ff9c',
                opacity: 0.72,
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                letterSpacing: '0.1em',
                marginTop: '0.3rem',
              }}
            >
              ∞ LOOP
            </span>
          </aside>
        )}
      </div>

      <GlitchTransition
        transitionId={transitionState.id}
        active={transitionState.active}
        reducedMotion={reducedMotion}
        glitchIntensityRef={glitchIntensityRef}
        onMidpoint={handleMidpointSwap}
        onComplete={handleTransitionComplete}
      />
    </div>
  );
}
