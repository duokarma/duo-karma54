import { COLORS } from './ui/theme';
import { Reveal } from './ui/Reveal';
import { MagneticButton } from './ui/MagneticButton';

export function CTA() {
  return (
    <section
      style={{
        padding: "160px 5%",
        background: `radial-gradient(circle at 50% 30%, ${COLORS.surface2} 0%, ${COLORS.bg} 70%)`,
        textAlign: "center",
      }}
    >
      <Reveal>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: "clamp(32px, 5.5vw, 68px)",
            color: COLORS.text,
            marginBottom: 34,
          }}
        >
          Ready to modernize
          <br />
          your business?
        </h2>
        <MagneticButton primary onClick={() => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        }}>Book free consultation</MagneticButton>
      </Reveal>
    </section>
  );
}