import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

const PRINCIPLES = [
  {
    title: "Direct Partnership",
    description: "You work directly with the engineers writing the code. No account managers, no miscommunication, no game of telephone."
  },
  {
    title: "Business-Driven",
    description: "We don't just ship features; we solve operational bottlenecks. Every line of code is tied to efficiency, revenue, or scale."
  },
  {
    title: "Built to Last",
    description: "We use enterprise-grade architecture. Your system is built to handle your growth for the next five years, without needing a rewrite."
  },
  {
    title: "Absolute Transparency",
    description: "No black boxes. You get weekly updates, staging links, and a clear view into exactly what we are building and why."
  }
];

export function About() {
  return (
    <section style={{ padding: "140px 5%", background: COLORS.bg }}>
      <Reveal>
        <Eyebrow>About DuoKarma</Eyebrow>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: "clamp(28px, 3.6vw, 46px)",
            color: COLORS.text,
            maxWidth: 680,
            marginBottom: 80,
          }}
        >
          Two people, one discipline: build the software a business will still be running in five years.
        </h2>
      </Reveal>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "48px 40px",
          borderTop: `1px solid ${COLORS.line}`,
          paddingTop: 60,
        }}
      >
        {PRINCIPLES.map((principle, i) => (
          <Reveal delay={i * 0.1} key={principle.title}>
            <div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: COLORS.accent,
                  marginBottom: 16,
                }}
              >
                0{i + 1} //
              </div>
              <h3
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 22,
                  color: COLORS.text,
                  marginBottom: 12,
                }}
              >
                {principle.title}
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: COLORS.secondary, lineHeight: 1.6, margin: 0 }}>
                {principle.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}