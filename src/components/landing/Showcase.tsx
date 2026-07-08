import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';
import { supabase } from '@/lib/supabase'; // assuming this exists

const FALLBACK_PROJECTS = [
  {
    title: "Salon Management Platform",
    problem: "Three salons were running bookings across phone calls, WhatsApp, and paper registers — no shared view of the day.",
    solution: "A unified admin panel covering appointments, staff schedules, billing, and client history, live across every location.",
    features: ["Live appointment calendar", "Staff & service management", "Client history & billing", "Role-based access"],
    color: COLORS.accent,
  },
  {
    title: "Farmhouse Booking Website",
    problem: "A weekend-farmhouse rental had no way to show availability or take bookings without back-and-forth calls.",
    solution: "A public booking site with a live calendar, transparent pricing, and instant confirmation — no phone tag required.",
    features: ["Live availability calendar", "Dynamic pricing rules", "Instant booking confirmation", "Mobile-first design"],
    color: COLORS.emerald,
  },
  {
    title: "Farmhouse Admin Dashboard",
    problem: "The owner needed to manage bookings, blackout dates, and revenue without touching a spreadsheet.",
    solution: "A companion admin dashboard synced to the booking site, giving a real-time operational view of the property.",
    features: ["Booking & revenue overview", "Blackout date management", "Guest communication log", "Supabase-backed sync"],
    color: COLORS.accent2,
  },
];

function ProjectCard({ project, index }: any) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={index * 0.1}>
      <motion.div
        layout
        onClick={() => setOpen((o) => !o)}
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.line}`,
          borderRadius: 20,
          padding: "36px 34px",
          cursor: "pointer",
          marginBottom: 22,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: project.color || COLORS.accent,
                marginBottom: 16,
              }}
            />
            <h3
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "clamp(22px, 2.6vw, 32px)",
                color: COLORS.text,
                fontWeight: 400,
                marginBottom: 8,
              }}
            >
              {project.title}
            </h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: COLORS.secondary, maxWidth: 520, lineHeight: 1.6 }}>
              {project.problem}
            </p>
          </div>
          <motion.div
            animate={{ rotate: open ? 45 : 0 }}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 22,
              color: COLORS.accent,
              flexShrink: 0,
            }}
          >
            +
          </motion.div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ paddingTop: 26, borderTop: `1px solid ${COLORS.line}`, marginTop: 26 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: project.color || COLORS.accent, marginBottom: 10, textTransform: "uppercase" }}>
                  What we built
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: COLORS.text, lineHeight: 1.7, marginBottom: 20, maxWidth: 560 }}>
                  {project.solution}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {project.features && project.features.map((f: string) => (
                    <span
                      key={f}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12.5,
                        padding: "8px 14px",
                        borderRadius: 999,
                        border: `1px solid ${COLORS.line}`,
                        color: COLORS.secondary,
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Reveal>
  );
}

export function Showcase() {
  const [projects, setProjects] = useState<any[]>(FALLBACK_PROJECTS);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await supabase.from('portfolio_items').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setProjects(data);
        }
      } catch (e) {
        // use fallback
      }
    };
    fetchProjects();
  }, []);

  return (
    <section style={{ padding: "140px 5%", background: COLORS.bg }}>
      <Reveal>
        <Eyebrow>Selected work</Eyebrow>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: "clamp(28px, 3.6vw, 46px)",
            color: COLORS.text,
            marginBottom: 60,
            maxWidth: 620,
          }}
        >
          Real systems, running in production.
        </h2>
      </Reveal>
      <div>
        {projects.map((p: any, i: any) => (
          <ProjectCard project={p} index={i} key={p.title} />
        ))}
      </div>
    </section>
  );
}