import { useState, useEffect, useRef } from 'react';
import { COLORS } from './ui/theme';

function Counter({ to, suffix = "" }: { to: number, suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const duration = 1400;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setVal(Math.round(eased * to));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, started]);

  return (
    <div ref={ref} style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(40px, 5vw, 64px)", color: COLORS.accent }}>
      {val}
      {suffix}
    </div>
  );
}

export function Stats() {
  const stats = [
    { to: 5, label: "Projects built" },
    { to: 4, label: "Businesses served" },
    { to: 30, suffix: "+", label: "Features developed" },
    { to: 18, label: "Modules created" },
  ];
  return (
    <section style={{ padding: "120px 5%", background: COLORS.bg, borderTop: `1px solid ${COLORS.line}`, borderBottom: `1px solid ${COLORS.line}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 30 }}>
        {stats.map((s) => (
          <div key={s.label}>
            <Counter to={s.to} suffix={s.suffix} />
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: COLORS.secondary, marginTop: 8 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}