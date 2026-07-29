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
          className="fixed inset-0 z-[9999] bg-[#000000] flex items-center justify-center overflow-hidden"
        >
          {isMobile ? (
            // Mobile: perfectly fade the video's top and bottom edges into the black background using a CSS mask
            <div 
              className="relative w-full aspect-video"
              style={{
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
              }}
            >
              <video
                src="/intro.mp4"
                autoPlay
                muted
                playsInline
                onEnded={() => setIsExiting(true)}
                className="w-full h-full object-cover"
              />
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
