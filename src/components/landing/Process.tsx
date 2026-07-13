import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync scroll progress to the progress bar
  const { scrollXProgress } = useScroll({ container: scrollRef });
  const progressWidth = useTransform(scrollXProgress, [0, 1], ['0%', '100%']);

  return (
    <section
      id="process"
      style={{
        background: COLORS.bg,
        position: 'relative',
        padding: '120px 0', // Natural document flow, no sticky height hacks
      }}
    >
      <div style={{ padding: '0 5%' }}>
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

        {/* Progress bar mapped directly to the native scroll container */}
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
      </div>

      {/* Native Horizontal Scroll Container for 120fps zero-lag performance */}
      <div
        ref={scrollRef}
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: 24,
          overflowX: 'auto',
          padding: '0 5%',
          paddingBottom: 40,
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
      >
        <style>
          {`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        {PROCESS.map((step) => (
          <ProcessCard key={step.step} step={step} />
        ))}
      </div>

      <div style={{ padding: '0 5%' }}>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: COLORS.secondary,
            letterSpacing: '0.08em',
            marginTop: 10,
          }}
        >
          Swipe to progress →
        </div>
      </div>
    </section>
  );
}

function ProcessCard({ step }: { step: typeof PROCESS[0] }) {
  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        background: COLORS.surface,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 20,
        padding: '28px 24px',
        scrollSnapAlign: 'start',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.accent, letterSpacing: '0.1em' }}>
          {step.step}
        </span>
        <div style={{ color: COLORS.accent, opacity: 0.7 }}>
          {step.icon}
        </div>
      </div>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.accent, marginBottom: 14 }} />
      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: COLORS.text, fontWeight: 400, marginBottom: 10 }}>
        {step.title}
      </h3>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: COLORS.secondary, lineHeight: 1.65 }}>
        {step.description}
      </p>
    </div>
  );
}