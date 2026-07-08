import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

const TIMELINE = [
  { label: "Idea", text: "A founder describes the business problem — no code yet, just chaos to untangle." },
  { label: "Planning", text: "We map data, roles, and workflows into a system architecture that will hold up." },
  { label: "Development", text: "Real components, real state, real interactions — built to survive daily use." },
  { label: "Deployment", text: "Shipped, monitored, and handed over with documentation your team can act on." },
  { label: "Growth", text: "Systems evolve with the business — new modules, not new rewrites." },
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
            marginBottom: 90,
          }}
        >
          Two people, one discipline: build the software a business will still be running in five years.
        </h2>
      </Reveal>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 0,
          borderTop: `1px solid ${COLORS.line}`,
        }}
      >
        {TIMELINE.map((step, i) => (
          <Reveal delay={i * 0.08} key={step.label}>
            <div
              style={{
                borderRight: i < TIMELINE.length - 1 ? `1px solid ${COLORS.line}` : "none",
                padding: "28px 20px 0",
                minHeight: 180,
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: COLORS.accent,
                  marginBottom: 12,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 19,
                  color: COLORS.text,
                  marginBottom: 10,
                }}
              >
                {step.label}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: COLORS.secondary, lineHeight: 1.6 }}>
                {step.text}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}