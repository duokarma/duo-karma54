import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

/* ─── Animated wireframe rectangle ─── */
function WRect({
  x, y, w, h, rx = 0, delay = 0, stage,
  polishFill = 'transparent',
  polishStroke = '#3B82F6',
}: {
  x: number; y: number; w: number; h: number; rx?: number;
  delay?: number; stage: number;
  polishFill?: string; polishStroke?: string;
}) {
  return (
    <motion.rect
      x={x} y={y} width={w} height={h} rx={rx}
      strokeWidth={1}
      pathLength={1}
      strokeDasharray="1"
      initial={{ strokeDashoffset: 1, fill: 'transparent', stroke: '#1E293B' }}
      animate={{
        strokeDashoffset: stage >= 2 ? 0 : 1,
        fill: stage >= 3 ? polishFill : 'transparent',
        stroke: stage >= 3 ? polishStroke : '#1E293B',
      }}
      transition={{
        strokeDashoffset: { duration: 1.2, delay, ease: 'easeInOut' },
        fill: { duration: 0.8, ease: 'easeOut' },
        stroke: { duration: 0.5, ease: 'easeOut' },
      }}
    />
  );
}

/* ─── Animated wireframe circle ─── */
function WCircle({
  cx, cy, r, delay = 0, stage, polishFill = 'transparent',
}: {
  cx: number; cy: number; r: number;
  delay?: number; stage: number; polishFill?: string;
}) {
  return (
    <motion.circle
      cx={cx} cy={cy} r={r}
      strokeWidth={0.8}
      pathLength={1}
      strokeDasharray="1"
      initial={{ strokeDashoffset: 1, fill: 'transparent', stroke: '#1E293B' }}
      animate={{
        strokeDashoffset: stage >= 2 ? 0 : 1,
        fill: stage >= 3 ? polishFill : 'transparent',
        stroke: stage >= 3 ? 'transparent' : '#1E293B',
      }}
      transition={{
        strokeDashoffset: { duration: 0.6, delay, ease: 'easeInOut' },
        fill: { duration: 0.6, ease: 'easeOut' },
        stroke: { duration: 0.3, ease: 'easeOut' },
      }}
    />
  );
}

/* ─── Animated wireframe line ─── */
function WLine({
  x1, y1, x2, y2, delay = 0, stage,
}: {
  x1: number; y1: number; x2: number; y2: number;
  delay?: number; stage: number;
}) {
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      strokeWidth={0.5}
      pathLength={1}
      strokeDasharray="1"
      initial={{ strokeDashoffset: 1, stroke: '#1E293B' }}
      animate={{ strokeDashoffset: stage >= 2 ? 0 : 1 }}
      transition={{ strokeDashoffset: { duration: 0.8, delay, ease: 'easeInOut' } }}
    />
  );
}

/* ─── Main LoadingScreen ─── */
export function LoadingScreen({ done }: { done: boolean }) {
  const [stage, setStage] = useState(0);
  const [shouldHide, setShouldHide] = useState(false);

  // Animation timeline
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 800),     // Blueprint grid fades in
      setTimeout(() => setStage(2), 1500),    // Wireframe starts drawing
      setTimeout(() => setStage(3), 3300),    // Polish — fills & colors
      setTimeout(() => setStage(4), 4800),    // Collapse back into logo
      setTimeout(() => setShouldHide(true), 6200), // Unmount
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Force-dismiss when parent signals done
  useEffect(() => {
    if (done) setShouldHide(true);
  }, [done]);

  const cardOffsets = [20, 172, 324];

  return (
    <AnimatePresence>
      {!shouldHide && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#090B10] overflow-hidden"
        >
          {/* ── Blueprint grid background ── */}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: stage >= 1 && stage < 4 ? 0.035 : 0 }}
            transition={{ duration: 0.8 }}
            style={{
              backgroundImage:
                'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* ── Main animation wrapper — collapses in stage 4 ── */}
          <motion.div
            className="relative flex flex-col items-center"
            animate={{
              scale: stage >= 4 ? 0.08 : 1,
              opacity: stage >= 4 ? 0 : 1,
            }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ── DuoKarma logo ── */}
            <motion.img
              src="/logo.jpeg"
              alt="DuoKarma"
              className="relative z-10 object-contain rounded-md"
              style={{ mixBlendMode: 'lighten' }}
              initial={{ opacity: 0, scale: 0.85, height: 80 }}
              animate={{
                opacity: 1,
                scale: 1,
                height: stage >= 2 ? 28 : 80,
                marginBottom: stage >= 2 ? 12 : 0,
              }}
              transition={{
                opacity: { duration: 0.7 },
                scale: { duration: 0.7, ease: 'easeOut' },
                height: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                marginBottom: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              }}
            />

            {/* ── Wireframe website ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: stage >= 2 ? 1 : 0,
                scale: stage >= 2 ? 1 : 0.95,
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                filter: stage >= 3 ? 'drop-shadow(0 0 24px rgba(59,130,246,0.12))' : 'none',
                transition: 'filter 0.8s ease',
              }}
            >
              <svg
                viewBox="0 0 480 300"
                className="w-full max-w-[480px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Browser window frame */}
                <WRect x={0} y={0} w={480} h={300} rx={8} delay={0} stage={stage}
                  polishFill="#0C1222" polishStroke="#1E293B" />

                {/* Window titlebar */}
                <WRect x={1} y={1} w={478} h={22} rx={7} delay={0.05} stage={stage}
                  polishFill="#111827" polishStroke="transparent" />
                {/* macOS window dots */}
                <WCircle cx={16} cy={12} r={4} delay={0.1} stage={stage} polishFill="#EF4444" />
                <WCircle cx={30} cy={12} r={4} delay={0.12} stage={stage} polishFill="#F59E0B" />
                <WCircle cx={44} cy={12} r={4} delay={0.14} stage={stage} polishFill="#22C55E" />

                {/* Navbar */}
                <WRect x={1} y={23} w={478} h={32} rx={0} delay={0.16} stage={stage}
                  polishFill="#0F172A" polishStroke="transparent" />
                {/* Navbar logo placeholder */}
                <WRect x={16} y={29} w={20} h={20} rx={4} delay={0.2} stage={stage}
                  polishFill="#3B82F6" polishStroke="#3B82F6" />
                {/* Nav links */}
                <WRect x={370} y={35} w={24} h={8} rx={2} delay={0.22} stage={stage}
                  polishFill="#475569" polishStroke="transparent" />
                <WRect x={402} y={35} w={24} h={8} rx={2} delay={0.24} stage={stage}
                  polishFill="#475569" polishStroke="transparent" />
                {/* Nav CTA */}
                <WRect x={434} y={31} w={32} h={16} rx={4} delay={0.26} stage={stage}
                  polishFill="#3B82F6" polishStroke="#3B82F6" />

                {/* Navbar divider */}
                <WLine x1={1} y1={55} x2={479} y2={55} delay={0.28} stage={stage} />

                {/* Hero — title */}
                <WRect x={100} y={78} w={280} h={14} rx={3} delay={0.35} stage={stage}
                  polishFill="#E2E8F0" polishStroke="transparent" />
                {/* Hero — subtitle */}
                <WRect x={140} y={100} w={200} h={8} rx={2} delay={0.42} stage={stage}
                  polishFill="#64748B" polishStroke="transparent" />
                {/* Hero — CTA button */}
                <WRect x={190} y={120} w={100} h={28} rx={6} delay={0.5} stage={stage}
                  polishFill="#3B82F6" polishStroke="#2563EB" />

                {/* Section divider */}
                <WLine x1={20} y1={164} x2={460} y2={164} delay={0.55} stage={stage} />

                {/* Feature cards ×3 */}
                {cardOffsets.map((cx, i) => {
                  const d = 0.6 + i * 0.1;
                  return (
                    <g key={i}>
                      {/* Card container */}
                      <WRect x={cx} y={176} w={136} h={108} rx={6} delay={d} stage={stage}
                        polishFill="#1E293B" polishStroke="#334155" />
                      {/* Card image area */}
                      <WRect x={cx + 8} y={184} w={120} h={40} rx={4} delay={d + 0.06} stage={stage}
                        polishFill="#111827" polishStroke="#1E293B" />
                      {/* Card text line 1 */}
                      <WRect x={cx + 8} y={234} w={80} h={6} rx={1} delay={d + 0.12} stage={stage}
                        polishFill="#475569" polishStroke="transparent" />
                      {/* Card text line 2 */}
                      <WRect x={cx + 8} y={246} w={56} h={6} rx={1} delay={d + 0.16} stage={stage}
                        polishFill="#334155" polishStroke="transparent" />
                      {/* Card action button */}
                      <WRect x={cx + 8} y={262} w={44} h={14} rx={4} delay={d + 0.2} stage={stage}
                        polishFill={i === 0 ? '#3B82F6' : '#1E293B'}
                        polishStroke={i === 0 ? '#3B82F6' : '#334155'} />
                    </g>
                  );
                })}
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}