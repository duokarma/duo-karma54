import { m as motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const easeOutExpo = [0.19, 1, 0.22, 1] as [number, number, number, number];

export function LoadingScreen({}: { done?: boolean }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);

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
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Main Video */}
          <video 
            src="/intro.mp4"
            autoPlay
            muted
            playsInline
            onEnded={() => setIsExiting(true)}
            className="w-full h-full object-contain md:object-cover z-10"
          />
          
          {/* Top and Bottom blending gradients for mobile (horizontal video masking) */}
          <div className="absolute inset-x-0 top-0 h-[35vh] bg-gradient-to-b from-black via-black/90 to-transparent pointer-events-none md:hidden z-20" />
          <div className="absolute inset-x-0 bottom-0 h-[35vh] bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none md:hidden z-20" />

        </motion.div>
      )}
    </AnimatePresence>
  );
}
