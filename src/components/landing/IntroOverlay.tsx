import { AnimatePresence, m as motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { IntroVideo } from './IntroVideo';
import { useIntroContext } from '@/context/IntroContext';

const EASE_OUT_EXPO: [number, number, number, number] = [0.19, 1, 0.22, 1];

/**
 * Full-screen intro overlay.
 *
 * - Fixed z-[9999] so it sits above every other element
 * - Locks scroll while the intro is playing
 * - Fades out over 700ms once the video ends
 * - Delegates video rendering to <IntroVideo>
 */
export function IntroOverlay() {
  const { introDone, onIntroDone } = useIntroContext();
  const [isMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  // If mobile, instantly finish the intro
  useEffect(() => {
    if (isMobile && !introDone) {
      onIntroDone();
    }
  }, [isMobile, introDone, onIntroDone]);

  // Lock scroll while intro is playing; release on completion
  useEffect(() => {
    if (isMobile) return;

    if (!introDone) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [introDone, isMobile]);

  if (isMobile) return null;

  return (
    <AnimatePresence>
      {!introDone && (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="fixed inset-0 z-[9999] bg-black overflow-hidden"
          aria-hidden="true"
        >
          <IntroVideo onEnded={onIntroDone} poster="/videos/poster.webp" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
