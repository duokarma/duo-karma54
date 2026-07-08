import { motion } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

const TECH = ["React", "Supabase", "Node", "PostgreSQL", "Vercel", "Three.js", "Tailwind"];

export function TechStack() {
  return (
    <section style={{ padding: "120px 5%", background: COLORS.surface }}>
      <Reveal>
        <Eyebrow>Technology</Eyebrow>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: "clamp(26px, 3.2vw, 40px)",
            color: COLORS.text,
            marginBottom: 50,
            maxWidth: 500,
          }}
        >
          Boring, reliable tools. Used well.
        </h2>
      </Reveal>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {TECH.map((t, i) => (
          <Reveal delay={i * 0.04} key={t}>
            <motion.div
              whileHover={{ scale: 1.06, borderColor: COLORS.accent }}
              style={{
                border: `1px solid ${COLORS.line}`,
                borderRadius: 999,
                padding: "12px 24px",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 13,
                color: COLORS.text,
              }}
            >
              {t}
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}