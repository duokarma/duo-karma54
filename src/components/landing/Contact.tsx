import { motion } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';
import { ConversationFlow } from './ConversationFlow';

const CONTACT_CARDS = [
  {
    label: "Google Meet",
    value: "Schedule a call",
    icon: "📅",
    href: "https://calendar.app.google/ycwYzWhqVRR6ZB3R9",
  },
  {
    label: "WhatsApp",
    value: "Message us directly",
    icon: "💬",
    href: "https://wa.me/918758457909",
  },
  {
    label: "Email",
    value: "duokarma54@gmail.com",
    icon: "✉️",
    href: "mailto:duokarma54@gmail.com",
  },
];

export function Contact() {
  return (
    <section style={{ padding: "120px 5% 100px", background: COLORS.bg }} id="contact">
      <Reveal>
        <Eyebrow>Contact</Eyebrow>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: "clamp(26px, 3.2vw, 40px)",
            color: COLORS.text,
            marginBottom: 50,
          }}
        >
          Start the conversation.
        </h2>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>

        {/* ── Guided Conversation ── */}
        <Reveal delay={0.1}>
          <ConversationFlow />
        </Reveal>

        {/* ── Contact Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, alignContent: 'start' }}>
          {CONTACT_CARDS.map((c, i) => (
            <Reveal delay={i * 0.06} key={c.label}>
              <motion.a
                href={c.href}
                target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={c.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                whileHover={{ y: -4, borderColor: COLORS.accent }}
                style={{
                  display: 'block',
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 16,
                  padding: 26,
                  background: COLORS.surface,
                  cursor: "pointer",
                  textDecoration: 'none',
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  {c.label}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: COLORS.text }}>{c.value}</div>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}