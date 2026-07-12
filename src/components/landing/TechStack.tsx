import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

const TECH_STACK = [
  {
    id: "react",
    name: "React",
    category: "Frontend",
    description: "We use React for building highly interactive, dynamic, and state-driven user interfaces. It allows us to create reusable components and manage complex frontend logic seamlessly.",
    color: "#61DAFB"
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "Backend & Auth",
    description: "Our go-to for instant, scalable backends. Supabase provides PostgreSQL, real-time subscriptions, and secure authentication out of the box.",
    color: "#3ECF8E"
  },
  {
    id: "node",
    name: "Node.js",
    category: "Server",
    description: "For custom backend logic, cron jobs, and third-party API integrations, Node provides a fast, JavaScript-native runtime.",
    color: "#339933"
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    category: "Database",
    description: "The world's most advanced open-source relational database. We rely on Postgres for robust data integrity and complex querying.",
    color: "#336791"
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "Infrastructure",
    description: "We deploy on Vercel for zero-config CI/CD, global edge caching, and serverless function support, ensuring lightning-fast load times.",
    color: "#FFFFFF"
  },
  {
    id: "threejs",
    name: "Three.js",
    category: "Creative",
    description: "When a project calls for immersive 3D experiences, we leverage Three.js to render WebGL graphics directly in the browser.",
    color: "#E8E8E8"
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "Styling",
    description: "Utility-first CSS framework that lets us rapidly build custom designs without leaving our HTML, ensuring a perfectly consistent design system.",
    color: "#38B2AC"
  },
  {
    id: "framer",
    name: "Framer Motion",
    category: "Animation",
    description: "The animation library that powers all our fluid transitions, physics-based micro-interactions, and scroll-driven effects.",
    color: "#FF0055"
  },
];

export function TechStack() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section style={{ padding: "140px 5%", background: COLORS.surface }}>
      <Reveal>
        <Eyebrow>Technology</Eyebrow>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: "clamp(26px, 3.2vw, 40px)",
            color: COLORS.text,
            marginBottom: 60,
            maxWidth: 600,
          }}
        >
          Boring, reliable tools. Used creatively.
        </h2>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {TECH_STACK.map((tech, i) => {
          const isActive = activeId === tech.id;
          return (
            <Reveal delay={i * 0.05} key={tech.id}>
              <motion.div
                layout
                onClick={() => setActiveId(isActive ? null : tech.id)}
                style={{
                  background: isActive ? "rgba(201,168,118,0.08)" : COLORS.surface2,
                  border: `1px solid ${isActive ? "rgba(201,168,118,0.4)" : COLORS.line}`,
                  borderRadius: 16,
                  padding: "24px",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
                whileHover={{ scale: isActive ? 1 : 1.02, borderColor: isActive ? "rgba(201,168,118,0.4)" : "rgba(201,168,118,0.2)" }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <motion.div layout style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: tech.color }} />
                    <h3 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: COLORS.text, margin: 0 }}>
                      {tech.name}
                    </h3>
                  </div>
                  <span style={{ fontSize: 11, color: COLORS.secondary, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {tech.category}
                  </span>
                </motion.div>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: COLORS.secondary, lineHeight: 1.6, margin: 0 }}>
                        {tech.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}