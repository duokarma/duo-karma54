import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

/* ─── Animated SVG Primitives ─────────────────────────────────────── */

function WRect({
  x, y, w, h, rx = 0, delay = 0, stage,
  polishFill = 'transparent', polishStroke = '#3B82F6',
}: {
  x: number; y: number; w: number; h: number; rx?: number;
  delay?: number; stage: number;
  polishFill?: string; polishStroke?: string;
}) {
  return (
    <motion.rect
      x={x} y={y} width={w} height={h} rx={rx}
      strokeWidth={1} pathLength={1} strokeDasharray="1"
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

function WCircle({
  cx, cy, r, delay = 0, stage, polishFill = 'transparent',
}: {
  cx: number; cy: number; r: number;
  delay?: number; stage: number; polishFill?: string;
}) {
  return (
    <motion.circle
      cx={cx} cy={cy} r={r}
      strokeWidth={0.8} pathLength={1} strokeDasharray="1"
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

/* ─── Loading Screen ──────────────────────────────────────────────── */

// Stage 0 → Grid appears (engineering canvas)
// Stage 1 → Blueprint lines, code brackets, dimension annotations
// Stage 2 → Wireframe draws, layout guides appear
// Stage 3 → Polish — fills & color, engineering elements fade
// Stage 4 → Interface collapses → DuoKarma logo emerges
// Stage 5 → Background fades, logo scales down, real site reveals

export function LoadingScreen({ done }: { done: boolean }) {
  const [stage, setStage] = useState(0);
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    const t = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1300),
      setTimeout(() => setStage(3), 3100),
      setTimeout(() => setStage(4), 4300),
      setTimeout(() => setStage(5), 5300),
      setTimeout(() => setShouldHide(true), 6200),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (done) setShouldHide(true);
  }, [done]);

  const mono = "'Geist Mono', 'IBM Plex Mono', monospace";
  const blue = '#3B82F6';
  const cardX = [20, 172, 324];

  return (
    <AnimatePresence>
      {!shouldHide && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
        >
          {/* ── Solid background — fades to reveal site at stage 5 ── */}
          <motion.div
            className="absolute inset-0 bg-[#090B10]"
            animate={{ opacity: stage >= 5 ? 0 : 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* ── Blueprint grid (engineering canvas) ── */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 1 && stage < 4 ? 0.04 : 0 }}
            transition={{ duration: 0.8 }}
            style={{
              backgroundImage:
                'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* ── Engineering canvas + wireframe ── */}
          <motion.div
            className="relative z-10"
            animate={{
              scale: stage >= 4 ? 0.04 : 1,
              opacity: stage >= 4 ? 0 : 1,
            }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg
              viewBox="0 0 600 400"
              className="w-full max-w-[900px]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* ── Blueprint crosshair lines ── */}
              <motion.line
                x1={0} y1={200} x2={600} y2={200}
                stroke={blue} strokeWidth={0.5} strokeDasharray="8 4"
                animate={{ opacity: stage >= 1 && stage < 3 ? 0.18 : 0 }}
                transition={{ duration: 0.6 }}
              />
              <motion.line
                x1={300} y1={0} x2={300} y2={400}
                stroke={blue} strokeWidth={0.5} strokeDasharray="8 4"
                animate={{ opacity: stage >= 1 && stage < 3 ? 0.18 : 0 }}
                transition={{ duration: 0.6 }}
              />

              {/* ── Code brackets ── */}
              <motion.text
                x={20} y={68} fill={blue} fontSize={30}
                fontFamily={mono} fontWeight={300}
                animate={{ opacity: stage >= 1 && stage < 3 ? 0.2 : 0 }}
                transition={{ duration: 0.5, delay: stage === 1 ? 0.15 : 0 }}
              >
                {'{\u200B'}
              </motion.text>
              <motion.text
                x={572} y={385} fill={blue} fontSize={30}
                fontFamily={mono} fontWeight={300} textAnchor="end"
                animate={{ opacity: stage >= 1 && stage < 3 ? 0.2 : 0 }}
                transition={{ duration: 0.5, delay: stage === 1 ? 0.25 : 0 }}
              >
                {'}\u200B'}
              </motion.text>

              {/* ── Width measurement: 480px ── */}
              <motion.g
                animate={{ opacity: stage >= 1 && stage < 3 ? 0.22 : 0 }}
                transition={{ duration: 0.5, delay: stage === 1 ? 0.1 : 0 }}
              >
                <line x1={60} y1={38} x2={60} y2={46} stroke={blue} strokeWidth={0.5} />
                <line x1={540} y1={38} x2={540} y2={46} stroke={blue} strokeWidth={0.5} />
                <line x1={60} y1={42} x2={540} y2={42} stroke={blue} strokeWidth={0.5} strokeDasharray="4 3" />
                <text x={300} y={36} fill={blue} fontSize={9} fontFamily={mono} textAnchor="middle">
                  480px
                </text>
              </motion.g>

              {/* ── Height measurement: 300px ── */}
              <motion.g
                animate={{ opacity: stage >= 1 && stage < 3 ? 0.22 : 0 }}
                transition={{ duration: 0.5, delay: stage === 1 ? 0.15 : 0 }}
              >
                <line x1={552} y1={50} x2={560} y2={50} stroke={blue} strokeWidth={0.5} />
                <line x1={552} y1={350} x2={560} y2={350} stroke={blue} strokeWidth={0.5} />
                <line x1={556} y1={50} x2={556} y2={350} stroke={blue} strokeWidth={0.5} strokeDasharray="4 3" />
                <text
                  x={570} y={200} fill={blue} fontSize={9} fontFamily={mono}
                  textAnchor="middle" dominantBaseline="middle"
                  transform="rotate(90, 570, 200)"
                >
                  300px
                </text>
              </motion.g>

              {/* ── Navbar height annotation: 32px ── */}
              <motion.g
                animate={{ opacity: stage >= 2 && stage < 3 ? 0.2 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <line x1={46} y1={73} x2={54} y2={73} stroke={blue} strokeWidth={0.5} />
                <line x1={46} y1={105} x2={54} y2={105} stroke={blue} strokeWidth={0.5} />
                <line x1={50} y1={73} x2={50} y2={105} stroke={blue} strokeWidth={0.5} strokeDasharray="3 2" />
                <text
                  x={42} y={89} fill={blue} fontSize={7} fontFamily={mono}
                  textAnchor="end" dominantBaseline="middle"
                >
                  32px
                </text>
              </motion.g>

              {/* ── Card section annotation: 136px ── */}
              <motion.g
                animate={{ opacity: stage >= 2 && stage < 3 ? 0.18 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <line x1={80} y1={358} x2={80} y2={366} stroke={blue} strokeWidth={0.5} />
                <line x1={196} y1={358} x2={196} y2={366} stroke={blue} strokeWidth={0.5} />
                <line x1={80} y1={362} x2={196} y2={362} stroke={blue} strokeWidth={0.5} strokeDasharray="3 2" />
                <text
                  x={138} y={374} fill={blue} fontSize={7} fontFamily={mono}
                  textAnchor="middle"
                >
                  136px
                </text>
              </motion.g>

              {/* ━━━━ Wireframe browser window (local coords: 480×300) ━━━━ */}
              <g transform="translate(60, 50)">
                {/* Browser frame */}
                <WRect x={0} y={0} w={480} h={300} rx={8} delay={0} stage={stage}
                  polishFill="#0C1222" polishStroke="#1E293B" />

                {/* Titlebar */}
                <WRect x={1} y={1} w={478} h={22} rx={7} delay={0.05} stage={stage}
                  polishFill="#111827" polishStroke="transparent" />
                <WCircle cx={16} cy={12} r={4} delay={0.08} stage={stage} polishFill="#EF4444" />
                <WCircle cx={30} cy={12} r={4} delay={0.1} stage={stage} polishFill="#F59E0B" />
                <WCircle cx={44} cy={12} r={4} delay={0.12} stage={stage} polishFill="#22C55E" />

                {/* Navbar */}
                <WRect x={1} y={23} w={478} h={32} rx={0} delay={0.14} stage={stage}
                  polishFill="#0F172A" polishStroke="transparent" />
                <WRect x={16} y={29} w={20} h={20} rx={4} delay={0.18} stage={stage}
                  polishFill="#3B82F6" polishStroke="#3B82F6" />
                <WRect x={370} y={35} w={24} h={8} rx={2} delay={0.2} stage={stage}
                  polishFill="#475569" polishStroke="transparent" />
                <WRect x={402} y={35} w={24} h={8} rx={2} delay={0.22} stage={stage}
                  polishFill="#475569" polishStroke="transparent" />
                <WRect x={434} y={31} w={32} h={16} rx={4} delay={0.24} stage={stage}
                  polishFill="#3B82F6" polishStroke="#3B82F6" />

                {/* Navbar divider */}
                <motion.line
                  x1={1} y1={55} x2={479} y2={55}
                  stroke="#1E293B" strokeWidth={0.5} pathLength={1} strokeDasharray="1"
                  initial={{ strokeDashoffset: 1 }}
                  animate={{ strokeDashoffset: stage >= 2 ? 0 : 1 }}
                  transition={{ strokeDashoffset: { duration: 0.8, delay: 0.26, ease: 'easeInOut' } }}
                />

                {/* Hero — title */}
                <WRect x={100} y={78} w={280} h={14} rx={3} delay={0.32} stage={stage}
                  polishFill="#E2E8F0" polishStroke="transparent" />
                {/* Hero — subtitle */}
                <WRect x={140} y={100} w={200} h={8} rx={2} delay={0.38} stage={stage}
                  polishFill="#64748B" polishStroke="transparent" />
                {/* Hero — CTA */}
                <WRect x={190} y={120} w={100} h={28} rx={6} delay={0.45} stage={stage}
                  polishFill="#3B82F6" polishStroke="#2563EB" />

                {/* Section divider */}
                <motion.line
                  x1={20} y1={164} x2={460} y2={164}
                  stroke="#1E293B" strokeWidth={0.5} pathLength={1} strokeDasharray="1"
                  initial={{ strokeDashoffset: 1 }}
                  animate={{ strokeDashoffset: stage >= 2 ? 0 : 1 }}
                  transition={{ strokeDashoffset: { duration: 0.8, delay: 0.5, ease: 'easeInOut' } }}
                />

                {/* Feature cards ×3 */}
                {cardX.map((cx, i) => {
                  const d = 0.55 + i * 0.1;
                  return (
                    <g key={i}>
                      <WRect x={cx} y={176} w={136} h={108} rx={6} delay={d} stage={stage}
                        polishFill="#1E293B" polishStroke="#334155" />
                      <WRect x={cx + 8} y={184} w={120} h={40} rx={4} delay={d + 0.06} stage={stage}
                        polishFill="#111827" polishStroke="#1E293B" />
                      <WRect x={cx + 8} y={234} w={80} h={6} rx={1} delay={d + 0.1} stage={stage}
                        polishFill="#475569" polishStroke="transparent" />
                      <WRect x={cx + 8} y={246} w={56} h={6} rx={1} delay={d + 0.14} stage={stage}
                        polishFill="#334155" polishStroke="transparent" />
                      <WRect x={cx + 8} y={262} w={44} h={14} rx={4} delay={d + 0.18} stage={stage}
                        polishFill={i === 0 ? '#3B82F6' : '#1E293B'}
                        polishStroke={i === 0 ? '#3B82F6' : '#334155'} />
                    </g>
                  );
                })}
              </g>
            </svg>
          </motion.div>

          {/* ── DuoKarma logo — emerges from the collapsed interface ── */}
          <motion.img
            src="/logo.jpeg"
            alt="DuoKarma"
            className="absolute h-28 w-auto object-contain rounded-lg z-20"
            style={{ mixBlendMode: 'lighten' }}
            initial={{ opacity: 0, scale: 1.3 }}
            animate={{
              opacity: stage >= 4 ? (stage >= 5 ? 0 : 1) : 0,
              scale: stage >= 5 ? 0.85 : stage >= 4 ? 1 : 1.3,
            }}
            transition={{
              opacity: { duration: stage >= 5 ? 0.8 : 0.5, ease: 'easeOut' },
              scale: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}