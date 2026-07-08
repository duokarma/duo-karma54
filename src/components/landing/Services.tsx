import { motion } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

const SERVICES = [
  "Custom Software", "Admin Dashboards", "Booking Platforms", "Business Automation",
  "Business Websites", "Cloud Deployment", "Supabase Integration", "Responsive Applications",
];

export function Services() {
  return (
    <section style={{ padding: "140px 5%", background: COLORS.surface }} id="services">
      <Reveal>
        <Eyebrow>Services</Eyebrow>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: "clamp(28px, 3.6vw, 46px)",
            color: COLORS.text,
            marginBottom: 60,
            maxWidth: 500,
          }}
        >
          What you can hand us.
        </h2>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {SERVICES.map((s, i) => (
          <Reveal delay={i * 0.05} key={s}>
            <motion.div
              whileHover={{ borderColor: COLORS.accent, y: -3 }}
              style={{
                border: `1px solid ${COLORS.line}`,
                borderRadius: 14,
                padding: "26px 22px",
                background: COLORS.surface2,
                transition: "border-color 0.3s",
              }}
            >
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: COLORS.text }}>{s}</div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}