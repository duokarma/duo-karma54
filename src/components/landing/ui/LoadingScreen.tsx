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
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
        >
          {isMobile ? (
            // Mobile: center the horizontal video in the screen, blend top/bottom into black naturally
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                src="/intro.mp4"
                autoPlay
                muted
                playsInline
                onEnded={() => setIsExiting(true)}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
              {/* Soft blend — top */}
              <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '30%', background: 'linear-gradient(to bottom, #000000 0%, #000000 30%, transparent 100%)' }} />
              {/* Soft blend — bottom */}
              <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: '30%', background: 'linear-gradient(to top, #000000 0%, #000000 30%, transparent 100%)' }} />
            </div>
          ) : (
            // Desktop/Laptop: full cover
            <video
              src="/intro.mp4"
              autoPlay
              muted
              playsInline
              onEnded={() => setIsExiting(true)}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
