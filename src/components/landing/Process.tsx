import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

const PROCESS = ["Discover", "Design", "Develop", "Test", "Deploy", "Support"];

export function Process() {
  return (
    <section style={{ padding: "140px 5%", background: COLORS.bg }} id="process">
      <Reveal>
        <Eyebrow>Development process</Eyebrow>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: "clamp(28px, 3.6vw, 46px)",
            color: COLORS.text,
            marginBottom: 70,
            maxWidth: 560,
          }}
        >
          The same six stages, every project.
        </h2>
      </Reveal>
      <div style={{ display: "flex", overflowX: "auto", gap: 0, paddingBottom: 10 }}>
        {PROCESS.map((step, i) => (
          <Reveal delay={i * 0.07} key={step}>
            <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div style={{ textAlign: "center", width: 150 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: COLORS.accent,
                    margin: "0 auto 16px",
                  }}
                />
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: COLORS.text }}>{step}</div>
              </div>
              {i < PROCESS.length - 1 && (
                <div style={{ width: 60, height: 1, background: COLORS.line, flexShrink: 0 }} />
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}