import { useCallback, useRef, useState } from 'react';
import { SECTIONS } from '../data/portfolioData';

// Collider energy levels per section: Home=rest, deeper sections=more power
const SECTION_ENERGY = {
  home: 0,
  about: 0.45,
  projects: 0.72,
  contact: 1.0,
};

export function useSectionNavigation(reducedMotion) {
  const [activeSection, setActiveSection] = useState('home');
  const [transitionState, setTransitionState] = useState({ active: false, id: 0 });
  const isTransitioningRef = useRef(false);
  const pendingSectionRef = useRef(null);

  const navigateTo = useCallback(
    (nextId) => {
      if (!nextId || nextId === activeSection) return;
      if (isTransitioningRef.current) return;

      if (reducedMotion) {
        setActiveSection(nextId);
        return;
      }

      isTransitioningRef.current = true;
      pendingSectionRef.current = nextId;
      setTransitionState((prev) => ({ active: true, id: prev.id + 1 }));
    },
    [activeSection, reducedMotion]
  );

  const handleMidpointSwap = useCallback(() => {
    if (pendingSectionRef.current) {
      setActiveSection(pendingSectionRef.current);
    }
  }, []);

  const handleTransitionComplete = useCallback(() => {
    isTransitioningRef.current = false;
    pendingSectionRef.current = null;
    setTransitionState((prev) => ({ ...prev, active: false }));
  }, []);

  // Infinite loop: wraps from last → first and first → last
  const stepSection = useCallback(
    (direction) => {
      const idx = SECTIONS.findIndex((s) => s.id === activeSection);
      let nextIdx = idx + direction;
      // Wrap around for infinite loop
      if (nextIdx >= SECTIONS.length) {
        nextIdx = 0;
      } else if (nextIdx < 0) {
        nextIdx = SECTIONS.length - 1;
      }
      if (nextIdx !== idx) {
        navigateTo(SECTIONS[nextIdx].id);
      }
    },
    [activeSection, navigateTo]
  );

  const targetEnergy = SECTION_ENERGY[activeSection] ?? 0;

  return {
    activeSection,
    transitionState,
    targetEnergy,
    navigateTo,
    stepSection,
    handleMidpointSwap,
    handleTransitionComplete,
  };
}
