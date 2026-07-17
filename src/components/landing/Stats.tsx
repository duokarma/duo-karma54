import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Reveal } from './ui/Reveal';
import { TiltCard } from '@/components/premium/tilt-card';

// Rolling digit component — each digit rolls independently
function RollingDigit({ digit, delay = 0 }: { digit: string; delay?: number }) {
  const isNum = !isNaN(Number(digit));
  if (!isNum) {
    return (
      <span style={{ display: 'inline-block', color: COLORS.accent }}>
        {digit}
      </span>
    );
  }
  const num = Number(digit);
  const digits = Array.from({ length: 10 }, (_, i) => i);

  return (
    <span
      style={{
        display: 'inline-block',
        overflow: 'hidden',
        height: '1.1em',
        verticalAlign: 'bottom',
      }}
    >
      <motion.span
        initial={{ y: '0%' }}
        animate={{ y: `-${num * 10}%` }}
        transition={{ delay, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {digits.map((d) => (
          <span key={d} style={{ display: 'block', lineHeight: '1.1em' }}>
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function RollingCounter({ to, suffix = '', prefix = '', delay = 0 }: { to: number; suffix?: string; prefix?: string; delay?: number }) {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  const digits = to.toString().split('');

  return (
    <div
      ref={ref}
      style={{
        fontFamily: "'Fraunces', serif",
        fontSize: 'clamp(40px, 5vw, 64px)',
        color: COLORS.accent,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'baseline',
        gap: 1,
        fontWeight: 400,
      }}
    >
      {prefix}
      {started
        ? digits.map((d, i) => <RollingDigit key={i} digit={d} delay={delay + i * 0.05} />)
        : digits.map((d, i) => <span key={i} style={{ display: 'inline-block' }}>{isNaN(Number(d)) ? d : '0'}</span>)
      }
      {suffix && (
        <span style={{ fontSize: '0.6em', marginLeft: 2, color: COLORS.accent }}>{suffix}</span>
      )}
    </div>
  );
}

const STATS = [
  {
    to: 4,
    suffix: '',
    label: 'Projects in production',
    description: 'Live systems running real business operations daily.',
  },
  {
    to: 3,
    suffix: '',
    label: 'Businesses automated',
    description: 'Teams freed from manual work through custom software.',
  },
  {
    to: 30,
    suffix: '+',
    label: 'Features shipped',
    description: 'From calendars to billing engines — all production-grade.',
  },
  {
    to: 18,
    suffix: '',
    label: 'Modules built',
    description: 'Reusable, tested, and integrated across client systems.',
  },
];

export function Stats() {
  return (
    <section
      style={{
        padding: '120px 5%',
        background: COLORS.bg,
        borderTop: `1px solid ${COLORS.line}`,
        borderBottom: `1px solid ${COLORS.line}`,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px 40px',
        }}
      >
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <TiltCard>
              <div className="p-6 rounded-2xl transition-all duration-300 hover:bg-white/5">
                <RollingCounter to={s.to} suffix={s.suffix} delay={i * 0.1} />
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.text,
                    marginTop: 12,
                    marginBottom: 6,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: COLORS.secondary,
                    lineHeight: 1.6,
                    maxWidth: 220,
                  }}
                >
                  {s.description}
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}