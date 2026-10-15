import { AnimatePresence, m as motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useIntroContext } from '@/context/IntroContext';

const EASE_OUT_EXPO: [number, number, number, number] = [0.19, 1, 0.22, 1];

export function IntroOverlay() {
  const { introDone, onIntroDone } = useIntroContext();
  const [progress, setProgress] = useState(0);

  // Lock scroll while intro is playing; release on completion
  useEffect(() => {
    if (!introDone) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [introDone]);

  // Keyboard shortcut: ESC to skip intro
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onIntroDone();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onIntroDone]);

  // Smooth progress animation over 1.8 seconds
  useEffect(() => {
    if (introDone) return;
    const startTime = performance.now();
    const duration = 1800; // 1.8 seconds

    let frameId: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        frameId = requestAnimationFrame(tick);
      } else {
        // Give 250ms at 100% before dissolving
        setTimeout(() => {
          onIntroDone();
        }, 250);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [introDone, onIntroDone]);

  return (
    <AnimatePresence>
      {!introDone && (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
          className="fixed inset-0 z-[9999] bg-[#050608] flex flex-col items-center justify-center overflow-hidden px-6 select-none"
          aria-hidden="true"
        >
          {/* Ambient luminous radial backdrop */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background: 'radial-gradient(circle at 50% 48%, rgba(175, 221, 255, 0.16) 0%, rgba(10, 16, 26, 0.5) 45%, transparent 75%)',
            }}
          />

          {/* Precision Cybernetic Grid Background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage: `
                linear-gradient(rgba(175, 221, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(175, 221, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />

          {/* Top Skip Button */}
          <div className="absolute top-6 right-6 z-50">
            <button
              onClick={onIntroDone}
              className="text-[11px] font-mono tracking-widest uppercase text-white/50 hover:text-[#AFDDFF] px-3 py-1.5 rounded-full border border-white/10 hover:border-[#AFDDFF]/30 transition-all bg-white/[0.03] backdrop-blur-md"
            >
              Skip [ESC]
            </button>
          </div>

          {/* Center Brand Identity */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
            className="relative z-10 flex flex-col items-center text-center max-w-sm"
          >
            {/* Glowing Logo Card */}
            <div className="relative mb-6">
              {/* Outer pulsing atmospheric aura */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.35, 0.6, 0.35],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -inset-4 rounded-3xl blur-2xl"
                style={{ background: 'rgba(175, 221, 255, 0.35)' }}
              />

              {/* Full Logo Container */}
              <div className="relative w-52 sm:w-64 rounded-2xl p-2.5 bg-gradient-to-b from-[#161a22] to-[#0c0e14] border border-[#AFDDFF]/35 shadow-[0_0_40px_rgba(175,221,255,0.25)] flex items-center justify-center overflow-hidden">
                <img
                  src="/duokarma-full-logo.jpeg"
                  alt="DuoKarma — Your Vision, Engineered."
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
            </div>

            {/* Studio Tagline */}
            <p
              className="text-[11px] sm:text-xs tracking-[0.25em] uppercase text-white/55 font-mono mb-8"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Enterprise Software Studio
            </p>

            {/* Loading Meter Container */}
            <div className="w-48 sm:w-56 h-[2px] bg-white/10 rounded-full overflow-hidden relative mb-3">
              <motion.div
                className="h-full bg-gradient-to-r from-[#AFDDFF]/40 via-[#AFDDFF] to-white rounded-full relative"
                style={{
                  width: `${progress}%`,
                  boxShadow: '0 0 12px rgba(175, 221, 255, 0.8)',
                  transition: 'width 0.05s linear',
                }}
              />
            </div>

            {/* System Status Label */}
            <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#AFDDFF] animate-pulse" />
              <span>INITIALIZING SYSTEM // {progress}%</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
