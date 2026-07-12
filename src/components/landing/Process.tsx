import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

const PROCESS = [
  {
    step: '01',
    title: 'Discover',
    description: 'We map your current workflow, pain points, and business goals before writing a single line of code.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Research',
    description: 'We study your industry, competitors, and users to ground every decision in real data.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'UI Design',
    description: 'Interactive prototypes that look and feel like the final product — reviewed and refined with you.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6M9 12h6M9 15h4" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Development',
    description: 'Clean, typed, documented code shipped in stages. You see progress every week, not just at the end.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    step: '05',
    title: 'Testing',
    description: 'Every flow is tested across devices and edge cases before it touches your users.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    step: '06',
    title: 'Deployment',
    description: 'Zero-downtime releases to production. SSL, CDN, monitoring — all set up from day one.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    step: '07',
    title: 'Support',
    description: 'We stay on after launch. Bug fixes, feature additions, and performance audits are part of the deal.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
];

export function Process() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Map vertical scroll → horizontal translate using exact bounds (track width minus viewport width)
  const xRaw = useTransform(scrollYProgress, [0, 1], ['0%', 'calc(-100% + 100vw - 10vw)']);
  const x = useSpring(xRaw, { stiffness: 60, damping: 18 });

  // Progress bar fills as you scroll
  const progressWidth = useTransform(scrollYProgress, [0.05, 0.9], ['0%', '100%']);

  return (
    <section
      ref={sectionRef}
      id="process"
      style={{
        background: COLORS.bg,
        position: 'relative',
        // Tall enough so scrolling through provides enough scroll distance
        height: '400vh',
      }}
    >
      {/* Sticky container */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '0 5%',
        }}
      >
        <Reveal>
          <Eyebrow>Development process</Eyebrow>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              fontSize: 'clamp(26px, 3.2vw, 42px)',
              color: COLORS.text,
              marginBottom: 48,
              maxWidth: 520,
            }}
          >
            The same seven stages, every project.
          </h2>
        </Reveal>

        {/* Progress bar */}
        <div
          style={{
            height: 1,
            background: COLORS.line,
            marginBottom: 40,
            maxWidth: 600,
            position: 'relative',
          }}
        >
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: COLORS.accent,
              width: progressWidth,
              transformOrigin: 'left',
            }}
          />
        </div>

        {/* Horizontal track */}
        <div ref={trackRef} style={{ overflow: 'hidden' }}>
          <motion.div
            style={{ x, display: 'flex', gap: 24, width: 'max-content' }}
          >
            {PROCESS.map((step, i) => (
              <ProcessCard key={step.step} step={step} index={i} scrollYProgress={scrollYProgress} total={PROCESS.length} />
            ))}
          </motion.div>
        </div>

        {/* Step counter */}
        <motion.div
          style={{
            marginTop: 40,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: COLORS.secondary,
            letterSpacing: '0.08em',
          }}
        >
          Scroll to progress →
        </motion.div>
      </div>
    </section>
  );
}

function ProcessCard({ step, index, scrollYProgress, total }: { step: typeof PROCESS[0]; index: number; scrollYProgress: any; total: number }) {
  const start = 0.05 + (index / total) * 0.7;
  const end = start + 0.12;
  const opacity = useTransform(scrollYProgress, [start, end], [0.35, 1]);
  const scale = useTransform(scrollYProgress, [start, end], [0.94, 1]);

  return (
    <motion.div
      style={{
        opacity,
        scale,
        width: 280,
        flexShrink: 0,
        background: COLORS.surface,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 20,
        padding: '28px 24px',
      }}
    >
      {/* Step number + icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: COLORS.accent,
            letterSpacing: '0.1em',
          }}
        >
          {step.step}
        </span>
        <div style={{ color: COLORS.accent, opacity: 0.7 }}>
          {step.icon}
        </div>
      </div>

      {/* Dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: COLORS.accent,
          marginBottom: 14,
        }}
      />

      {/* Title */}
      <h3
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 22,
          color: COLORS.text,
          fontWeight: 400,
          marginBottom: 10,
        }}
      >
        {step.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13.5,
          color: COLORS.secondary,
          lineHeight: 1.65,
        }}
      >
        {step.description}
      </p>
    </motion.div>
  );
}