import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Atom } from 'lucide-react';

const STATUS_MESSAGES = [
  "Initializing Workspace...",
  "Connecting Backend...",
  "Loading Components...",
  "Compiling Resources...",
  "Optimizing Performance...",
  "Securing Environment...",
  "Launching Experience..."
];

export function LoadingScreen({ done }: { done: boolean }) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Progress logic
  useEffect(() => {
    if (done) {
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return prev;
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [done]);

  // Rotating messages logic
  useEffect(() => {
    if (done) return;
    
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % STATUS_MESSAGES.length);
    }, 2500);
    
    return () => clearInterval(messageInterval);
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#090B10] overflow-hidden"
        >
          {/* Subtle animated grid background */}
          <div 
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              backgroundPosition: 'center center'
            }}
          />

          {/* Light moving gradient effect */}
          <motion.div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.12), transparent 50%)'
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Faint floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-blue-400 rounded-full"
                style={{
                  width: Math.random() * 3 + 1 + 'px',
                  height: Math.random() * 3 + 1 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.3 + 0.1,
                }}
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 40 - 20, 0],
                }}
                transition={{
                  duration: Math.random() * 10 + 15,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex flex-col items-center z-10"
          >
            <div className="relative flex items-center justify-center mb-16">
              {/* Orbiting Atom */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute flex items-center justify-center pointer-events-none drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]"
              >
                <Atom color="#3B82F6" size={160} strokeWidth={1} />
              </motion.div>

              {/* Thin glowing circular progress ring */}
              <svg className="absolute w-[200px] h-[200px] -rotate-90 pointer-events-none">
                <circle
                  cx="100"
                  cy="100"
                  r="96"
                  className="stroke-[#3B82F6]/10"
                  strokeWidth="1.5"
                  fill="none"
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="96"
                  className="stroke-[#60A5FA] drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="603.18"
                  initial={{ strokeDashoffset: 603.18 }}
                  animate={{ strokeDashoffset: 603.18 - (progress / 100) * 603.18 }}
                  transition={{ ease: "easeOut", duration: 0.3 }}
                  strokeLinecap="round"
                />
              </svg>

              {/* Logo with breathing animation */}
              <motion.img
                src="/logo.jpeg"
                alt="DuoKarma"
                className="relative h-20 w-auto object-contain rounded drop-shadow-[0_0_25px_rgba(96,165,250,0.3)] z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            
            <div className="flex flex-col items-center gap-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={messageIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="text-[13px] font-medium tracking-[0.05em] text-[#8AB4F8]"
                >
                  {STATUS_MESSAGES[messageIndex]}
                </motion.div>
              </AnimatePresence>

              <div className="text-xs font-mono text-[#60A5FA]/60 tracking-widest">
                {progress}%
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}