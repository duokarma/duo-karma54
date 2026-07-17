import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

const PRINCIPLES = [
  {
    title: "No Middlemen",
    description: "You talk directly to the two people writing your code. There are no project managers or sales reps to pass messages through, so nothing gets lost in translation."
  },
  {
    title: "Business First",
    description: "We care about how your company actually operates. Instead of blindly building features, we look for the bottlenecks in your daily workflow and build tools to fix them."
  },
  {
    title: "Built Properly",
    description: "We take the time to set up a solid technical foundation. The goal is to build a system that easily handles your growth over the next few years without needing a painful rewrite."
  },
  {
    title: "Total Visibility",
    description: "We hate black boxes as much as you do. We share what we're working on every week, give you early access to test things, and explain our technical choices clearly."
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
