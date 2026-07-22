import { m as motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const easeOutExpo = [0.19, 1, 0.22, 1] as [number, number, number, number];

export function LoadingScreen({ done }: { done: boolean }) {
  const [stage, setStage] = useState(0); 
  // Stages:
  // 0: Initial (Hidden)
  // 1: Phase 1 & 2 & 3 (Logo fade in, glow, line draws)
  // 2: Ready to exit (Line drawn, waiting for `done`)
  // 3: Phase 4 (Shimmer)
  // 4: Phase 5 (Fade out)
  // 5: Unmounted

  useEffect(() => {
    // Start Phase 1 immediately
    setStage(1);
  }, []);

  useEffect(() => {
    if (stage === 1) {
      // Line takes 600ms to draw. Wait for it.
      const t = setTimeout(() => {
        setStage(2);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const [autoExit, setAutoExit] = useState(false);
  useEffect(() => {
    // Automatically exit after 1.8 seconds if `done` hasn't fired yet
    const t = setTimeout(() => setAutoExit(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const canExit = (done || autoExit) && stage >= 2;

  useEffect(() => {
    if (canExit && stage === 2) {
      setStage(3); // Start shimmer
    }
  }, [canExit, stage]);

  useEffect(() => {
    if (stage === 3) {
      const t1 = setTimeout(() => {
        setStage(4); // Start exit fade
      }, 400); // Shimmer duration
      return () => clearTimeout(t1);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 4) {
      const t2 = setTimeout(() => {
        setStage(5); // Unmount
      }, 500); // Exit fade duration
      return () => clearTimeout(t2);
    }
  }, [stage]);

  useEffect(() => {
    if (stage < 5) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [stage]);

  return (
    <AnimatePresence>
      {stage < 5 && (
        <motion.div
          key="loader"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#090909]"
        >
          <div className="relative flex flex-col items-center justify-center">
            
            {/* Phase 2: Soft gold glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: stage >= 1 ? 1 : 0, scale: stage >= 1 ? 1 : 0.8 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(201,162,39,0.15) 0%, rgba(201,162,39,0) 70%)',
              }}
            />

            {/* Phase 1: Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="relative z-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#090909] shadow-2xl border border-white/10"
            >
              <img src="/logo.jpeg" alt="DuoKarma" className="h-full w-full object-cover" />
              
              {/* Phase 4: Soft Shimmer */}
              <motion.div
                initial={{ x: '-150%' }}
                animate={{ x: stage >= 3 ? '150%' : '-150%' }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute inset-0 z-20 w-full pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  transform: 'skewX(-20deg)',
                }}
              />
            </motion.div>

            {/* Phase 3: Gold Line */}
            <div className="mt-8 h-[2px] w-[120px] overflow-hidden rounded-full bg-white/5 relative">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: stage >= 1 ? '0%' : '-100%' }}
                transition={{ duration: 0.6, ease: easeOutExpo }}
                className="absolute inset-0 bg-[#C9A227] rounded-full"
              />
            </div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : 5 }}
              transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.1 }}
              className="mt-6 text-[rgba(255,255,255,0.65)] text-[11px] uppercase tracking-[0.25em] font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Engineering Your Vision
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
