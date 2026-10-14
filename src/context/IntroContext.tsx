import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface IntroContextValue {
  introDone: boolean;
  onIntroDone: () => void;
}

const IntroContext = createContext<IntroContextValue>({
  introDone: false,
  onIntroDone: () => {},
});

/** Returns true synchronously if we should skip the intro */
function shouldSkipIntro(): boolean {
  if (typeof window === 'undefined') return false;
  // Skip on mobile (touch devices) — no intro video plays there
  if (window.innerWidth < 768 || window.matchMedia('(hover: none)').matches) return true;
  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  return false;
}

export function IntroProvider({ children }: { children: React.ReactNode }) {
  // Initialise synchronously — mobile users never see opacity:0 flash
  const [introDone, setIntroDone] = useState(() => shouldSkipIntro());

  const onIntroDone = useCallback(() => {
    setIntroDone(true);
  }, []);

  // Safety fallback: never block the site forever on desktop
  useEffect(() => {
    if (introDone) return; // already done — no need for failsafe
    const failsafe = window.setTimeout(() => {
      console.warn('[IntroContext] Failsafe triggered — forcing introDone');
      setIntroDone(true);
    }, 12_000); // 12 s hard cap (reduced from 15 s)
    return () => window.clearTimeout(failsafe);
  }, [introDone]);

  return (
    <IntroContext.Provider value={{ introDone, onIntroDone }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntroContext(): IntroContextValue {
  return useContext(IntroContext);
}
