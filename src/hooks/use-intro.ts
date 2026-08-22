import { useIntroContext } from '@/context/IntroContext';

/**
 * Thin hook so components don't need to import the context directly.
 *
 * Usage:
 *   const { introDone, onIntroDone } = useIntro();
 */
export function useIntro() {
  return useIntroContext();
}
