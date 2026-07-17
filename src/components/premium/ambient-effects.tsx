import { memo } from "react";
import { motion } from "framer-motion";

export const AnimatedNoise = memo(() => {
  return (
    <div 
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        willChange: 'opacity',
      }}
    />
  );
});
AnimatedNoise.displayName = "AnimatedNoise";

export const SoftAurora = memo(() => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30 mix-blend-screen">
      <motion.div
        animate={{
          x: ["-20%", "20%", "-10%", "-20%"],
          y: ["-20%", "10%", "20%", "-20%"],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -top-1/4 -left-1/4 h-[80vh] w-[80vw] rounded-full"
        style={{
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(201,168,118,0.2) 0%, transparent 100%)',
          willChange: 'transform',
        }}
      />
      <motion.div
        animate={{
          x: ["20%", "-20%", "10%", "20%"],
          y: ["20%", "-10%", "-20%", "20%"],
          scale: [0.9, 1.1, 1, 0.9],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-1/4 -right-1/4 h-[80vh] w-[80vw] rounded-full"
        style={{
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(16,185,129,0.1) 0%, transparent 100%)',
          willChange: 'transform',
        }}
      />
    </div>
  );
});
SoftAurora.displayName = "SoftAurora";

export const FloatingParticles = memo(() => {
  // Generate random particles (memoized statically)
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1, // 1px to 4px
    x: Math.random() * 100, // 0% to 100%
    y: Math.random() * 100,
    duration: Math.random() * 20 + 20, // 20s to 40s
    delay: Math.random() * 5,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-50 mix-blend-screen">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: ["0%", "-100%"],
            x: ["0%", `${(Math.random() - 0.5) * 50}%`],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
});
FloatingParticles.displayName = "FloatingParticles";
