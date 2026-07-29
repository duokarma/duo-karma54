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
          className="fixed inset-0 z-[9999] bg-[#0f1523] flex items-center justify-center overflow-hidden"
        >
          {isMobile ? (
            // Mobile: use an ambient blur technique to perfectly match the video's background color
            <div className="relative w-full h-full flex items-center justify-center bg-[#0f1523] overflow-hidden">
              {/* Ambient Background Video (Blurred & Scaled to fill) */}
              <video
                src="/intro.mp4"
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover scale-[1.2] blur-[50px] opacity-80"
              />
              
              {/* Foreground Crisp Video */}
              <video
                src="/intro.mp4"
                autoPlay
                muted
                playsInline
                onEnded={() => setIsExiting(true)}
                className="relative z-10 w-full h-auto shadow-2xl"
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
