import { m as motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const easeOutExpo = [0.19, 1, 0.22, 1] as [number, number, number, number];

export function LoadingScreen({}: { done?: boolean }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isExiting) {
      // Allow time for exit animations to play before unmounting
      const t = setTimeout(() => setIsUnmounted(true), 1200);
      return () => clearTimeout(t);
    }
  }, [isExiting]);

  useEffect(() => {
    if (!isUnmounted) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isUnmounted]);

  return (
    <AnimatePresence>
      {!isUnmounted && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: easeOutExpo }}
          className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center overflow-hidden h-[100dvh] w-[100vw]"
        >
          {isMobile ? (
            // Mobile: Cinematic luxury vignette. Avoids severe cropping of the logo while blending flawlessly into the dark background.
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                src="/homepage-new.mp4"
                autoPlay
                muted
                playsInline
                onEnded={() => setIsExiting(true)}
                onError={() => setIsExiting(true)}
                className="relative w-[125%] max-w-none h-auto"
                style={{
                  WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 85%)',
                  maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 85%)'
                }}
              />
            </div>
          ) : (
            // Desktop/Laptop: full cover
            <video
              src="/homepage-new.mp4"
              autoPlay
              muted
              playsInline
              onEnded={() => setIsExiting(true)}
              onError={() => setIsExiting(true)}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
