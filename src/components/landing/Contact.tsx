import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';
import { ConversationFlow } from './ConversationFlow';

export function Contact() {
  return (
    <section style={{ padding: "120px 5% 100px", background: COLORS.bg }} id="contact">
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Eyebrow>Contact</Eyebrow>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 56px)",
              color: COLORS.text,
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            Let's build something exceptional.
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(15px, 1.5vw, 18px)",
              color: COLORS.secondary,
              maxWidth: 600,
              margin: '0 auto'
            }}
          >
            Takes about 2 minutes &bull; No sales pressure &bull; Free consultation
          </p>
        </div>
      </Reveal>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal delay={0.1}>
          <ConversationFlow />
        </Reveal>
      </div>
    </section>
  );
}