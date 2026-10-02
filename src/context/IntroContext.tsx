import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface IntroContextValue {
  introDone: boolean;
  onIntroDone: () => void;
}

const IntroContext = createContext<IntroContextValue>({
  introDone: false,
  onIntroDone: () => {},
});

export function IntroProvider({ children }: { children: React.ReactNode }) {
  // If the user prefers reduced motion, skip the intro entirely
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [introDone, setIntroDone] = useState(prefersReduced);

  const onIntroDone = useCallback(() => {
    setIntroDone(true);
  }, []);

  // Safety fallback: if something goes wrong, never block the site forever
  useEffect(() => {
    if (prefersReduced) return;
    const failsafe = window.setTimeout(() => {
      setIntroDone(true);
    }, 15_000); // 15 s hard cap
    return () => window.clearTimeout(failsafe);
  }, [prefersReduced]);

  return (
    <IntroContext.Provider value={{ introDone, onIntroDone }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntroContext(): IntroContextValue {
  return useContext(IntroContext);
}
