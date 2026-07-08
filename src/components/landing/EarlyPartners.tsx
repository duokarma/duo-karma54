import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

export function EarlyPartners() {
  return (
    <section style={{ padding: "100px 5%", background: COLORS.surface, textAlign: "center" }}>
      <Reveal>
        <Eyebrow>
          <span style={{ margin: "0 auto" }}>Building with early partners</span>
        </Eyebrow>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(20px, 2.4vw, 28px)", color: COLORS.text, maxWidth: 640, margin: "0 auto", lineHeight: 1.5 }}>
          We're still early — every current client is a founding partner. Testimonials will
          live here once the ink on real feedback is dry.
        </p>
      </Reveal>
    </section>
  );
}