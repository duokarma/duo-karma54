import { useState, useEffect, useRef } from 'react';
import { m as motion } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Reveal } from './ui/Reveal';

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
        transition={{ delay, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
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
      { threshold: 0.3 }
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
        fontSize: 'clamp(32px, 4.5vw, 60px)',
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
    description: 'Live systems running operations daily.',
  },
  {
    to: 3,
    suffix: '',
    label: 'Businesses automated',
    description: 'Teams freed from manual spreadsheet work.',
  },
  {
    to: 30,
    suffix: '+',
    label: 'Features shipped',
    description: 'From booking engines to billing pipelines.',
  },
  {
    to: 18,
    suffix: '',
    label: 'Core modules built',
    description: 'Tested and integrated across client apps.',
  },
];

export function Stats() {
  return (
    <section
      className="relative overflow-hidden py-14 md:py-32 px-5 md:px-[5%]"
      style={{
        background: COLORS.bg,
        borderTop: `1px solid ${COLORS.line}`,
        borderBottom: `1px solid ${COLORS.line}`,
      }}
    >
      {/* 2x2 on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-[1200px] mx-auto">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <div 
              className="p-5 md:p-8 rounded-2xl md:rounded-3xl transition-all duration-300 h-full flex flex-col justify-between"
              style={{
                background: 'linear-gradient(145deg, rgba(26, 23, 20, 0.75) 0%, rgba(12, 11, 10, 0.92) 100%)',
                border: '1px solid rgba(201, 168, 118, 0.16)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <RollingCounter to={s.to} suffix={s.suffix} delay={i * 0.1} />
              <div>
                <div
                  className="text-xs md:text-sm font-semibold text-white mt-3 mb-1"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {s.label}
                </div>
                <div
                  className="text-[11px] md:text-xs text-ink/60 leading-relaxed font-sans"
                >
                  {s.description}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
