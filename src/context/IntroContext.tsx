import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface IntroContextValue {
  introDone: boolean;
  onIntroDone: () => void;
}

const IntroContext = createContext<IntroContextValue>({
  introDone: false,
  onIntroDone: () => {},
});

/** Returns true synchronously if the intro has already been shown in this session */
function shouldSkipIntro(): boolean {
  if (typeof window === 'undefined') return false;
  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  // Skip if already seen in current session
  try {
    if (sessionStorage.getItem('dk_intro_played') === 'true') {
      return true;
    }
  } catch {
    // ignore storage restrictions
  }
  return false;
}

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [introDone, setIntroDone] = useState(() => shouldSkipIntro());

  const onIntroDone = useCallback(() => {
    try {
      sessionStorage.setItem('dk_intro_played', 'true');
    } catch {
      // ignore
    }
    setIntroDone(true);
  }, []);

  // Hard cap safety fallback: never block the site forever
  useEffect(() => {
    if (introDone) return;
    const failsafe = window.setTimeout(() => {
      onIntroDone();
    }, 4500); // 4.5s max cap
    return () => window.clearTimeout(failsafe);
  }, [introDone, onIntroDone]);

  return (
    <IntroContext.Provider value={{ introDone, onIntroDone }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntroContext(): IntroContextValue {
  return useContext(IntroContext);
}
