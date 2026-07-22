import { m as motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

const easeOutExpo = [0.19, 1, 0.22, 1] as [number, number, number, number];

const MESSAGES = [
  "Initializing DuoKarma OS...",
  "Loading AI Workforce...",
  "Connecting Intelligence...",
  "Preparing Mission Engine...",
  "Systems Ready."
];

export function LoadingScreen({ done }: { done: boolean }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  // Pre-generate stable random values for the micro particles
  const particles = useMemo(() => Array.from({ length: 18 }).map(() => ({
    top: 15 + Math.random() * 70,
    left: 15 + Math.random() * 70,
    delay: Math.random() * 2,
    duration: 5 + Math.random() * 4,
  })), []);

  useEffect(() => {
    if (isExiting) return;
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev < MESSAGES.length - 1 ? prev + 1 : prev));
    }, 450); 
    return () => clearInterval(interval);
  }, [isExiting]);

  const [autoExit, setAutoExit] = useState(false);
  useEffect(() => {
    // Ensure loader stays up long enough for the full sequence
    const t = setTimeout(() => setAutoExit(true), 2400);
    return () => clearTimeout(t);
  }, []);

  const canExit = done || autoExit;

  useEffect(() => {
    if (canExit && !isExiting) {
      setIsExiting(true);
    }
  }, [canExit, isExiting]);

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
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
        >
          {/* Grid Background */}
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              opacity: 0.06,
            }}
            animate={{ y: [0, 40], x: [0, 40] }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          />
          {/* Radial Gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_85%)] z-0 pointer-events-none" />

          {/* Camera Motion Wrapper */}
          <motion.div
            animate={isExiting ? { scale: 1.05, opacity: 0 } : { y: [0, -3, 0, 3, 0], x: [0, 2, 0, -2, 0] }}
            transition={
              isExiting 
                ? { duration: 0.8, ease: easeOutExpo }
                : { repeat: Infinity, duration: 8, ease: "easeInOut" }
            }
            className="relative z-10 flex flex-col items-center justify-center w-full h-full"
          >
            {/* Ambient Lighting Glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isExiting ? 0 : 0.15 }}
              transition={{ duration: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#C9A227] blur-[70px] pointer-events-none"
            />

            {/* Micro Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {particles.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute w-[1px] h-[1px] bg-white/40 rounded-full"
                  style={{ top: `${p.top}%`, left: `${p.left}%` }}
                  animate={{
                    y: [0, -15, -30],
                    x: [0, Math.random() * 10 - 5, Math.random() * 20 - 10],
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: p.duration,
                    ease: "easeInOut",
                    delay: p.delay
                  }}
                />
              ))}
            </div>

            {/* Orbiting AI Agents */}
            {[140, 170, 200].map((size, i) => (
              <motion.div
                key={`orbit-${i}`}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ width: size, height: size }}
                animate={{ rotate: isExiting ? (i % 2 === 0 ? 360 : -360) : (i % 2 === 0 ? 360 : -360) }}
                transition={
                  isExiting 
                    ? { duration: 1, ease: easeOutExpo }
                    : { repeat: Infinity, duration: 10 + i * 3, ease: "linear" }
                }
              >
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isExiting ? 0 : 1 }}
                  transition={{ duration: 1 }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-[3px] bg-[#C9A227] rounded-full shadow-[0_0_8px_rgba(201,162,39,0.9)]" 
                />
              </motion.div>
            ))}

            {/* Energy Pulse */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isExiting ? { opacity: 0, scale: 2 } : { opacity: [0, 0.12, 0], scale: [0.9, 1.9] }}
              transition={
                isExiting 
                  ? { duration: 0.8, ease: easeOutExpo }
                  : { repeat: Infinity, duration: 2, ease: "easeOut" }
              }
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-[#C9A227] pointer-events-none"
            />

            {/* AI Scanner Ring SVG */}
            <motion.svg
              width="220"
              height="220"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              initial={{ opacity: 0, rotate: 0 }}
              animate={isExiting ? { opacity: 0, scale: 1.2, rotate: 180 } : { opacity: 1, rotate: 360 }}
              transition={
                isExiting 
                  ? { duration: 0.8, ease: easeOutExpo }
                  : { opacity: { duration: 1 }, rotate: { repeat: Infinity, duration: 6, ease: "linear" } }
              }
            >
              {/* Outer dashed ring */}
              <circle cx="110" cy="110" r="109" fill="none" stroke="#C9A227" strokeWidth="1" strokeDasharray="2 10" opacity="0.3" />
              {/* Solid accent segment */}
              <circle cx="110" cy="110" r="109" fill="none" stroke="#C9A227" strokeWidth="1" strokeDasharray="120 600" strokeLinecap="round" opacity="0.8" />
            </motion.svg>

            {/* Progress Indicator Ring */}
            <motion.svg
              width="110"
              height="110"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -rotate-90"
            >
              <circle cx="55" cy="55" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
              <motion.circle 
                cx="55" cy="55" r="54" fill="none" stroke="#C9A227" strokeWidth="2"
                strokeDasharray="340"
                strokeDashoffset="340"
                animate={isExiting ? { strokeDashoffset: 0, opacity: 0 } : { strokeDashoffset: [340, 0] }}
                transition={isExiting ? { duration: 0.5 } : { duration: 2.3, ease: "linear" }}
              />
            </motion.svg>

            {/* Centerpiece Logo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={isExiting ? { scale: 1.04, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: easeOutExpo }}
              className="relative z-20 flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-[18px] bg-[#050505] border border-white/10 shadow-2xl"
            >
              <img src="/logo.jpeg" alt="DuoKarma" className="h-full w-full object-cover" />
            </motion.div>

            {/* Mission Initialization Text */}
            <div className="absolute top-[calc(50%+130px)] h-6 w-full flex justify-center items-center pointer-events-none">
              <AnimatePresence mode="wait">
                {!isExiting && (
                  <motion.div
                    key={msgIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-[#F5F5F5] text-[10px] tracking-[0.2em] font-medium uppercase absolute"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {MESSAGES[msgIndex]}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
