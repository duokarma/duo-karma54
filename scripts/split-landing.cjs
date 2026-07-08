const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const landingDir = path.join(srcDir, 'components', 'landing');
const uiDir = path.join(landingDir, 'ui');

[landingDir, uiDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const files = {
    'ui/theme.ts': `export const COLORS = {
  bg: "#0A0908",
  surface: "#15130F",
  surface2: "#1D1A14",
  accent: "#C9A876",
  accent2: "#E8CFA0",
  text: "#F3EEE3",
  secondary: "#8B8578",
  emerald: "#6E8F76",
  line: "rgba(243,238,227,0.09)",
};

export const FONT_IMPORT = \`
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
\`;
`,
    'ui/Eyebrow.tsx': `import React from 'react';
import { COLORS } from './theme';

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 12,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: COLORS.accent,
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ width: 22, height: 1, background: COLORS.accent, display: "inline-block" }} />
      {children}
    </div>
  );
}`,
    'ui/Reveal.tsx': `import React from 'react';
import { motion } from 'framer-motion';

export function Reveal({ children, delay = 0, y = 24 }: { children: React.ReactNode, delay?: number, y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}`,
    'ui/MagneticButton.tsx': `import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from './theme';

export function MagneticButton({ children, primary = false, onClick }: { children: React.ReactNode, primary?: boolean, onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.25;
    const y = (e.clientY - r.top - r.height / 2) * 0.25;
    setPos({ x, y });
  };
  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 12 }}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 14,
        fontWeight: 500,
        padding: "14px 30px",
        borderRadius: 999,
        border: primary ? "none" : \`1px solid \${COLORS.line}\`,
        background: primary ? COLORS.accent : "transparent",
        color: primary ? "#15130F" : COLORS.text,
        cursor: "pointer",
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </motion.button>
  );
}`,
    'ui/Cursor.tsx': `import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from './theme';

export function Cursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <motion.div
      animate={{ x: pos.x - 6, y: pos.y - 6 }}
      transition={{ type: "spring", stiffness: 800, damping: 40, mass: 0.3 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: COLORS.accent,
        pointerEvents: "none",
        zIndex: 9999,
        mixBlendMode: "difference",
      }}
      className="dk-cursor"
    />
  );
}`,
    'ui/LoadingScreen.tsx': `import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './theme';

export function LoadingScreen({ done }: { done: boolean }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "fixed",
            inset: 0,
            background: COLORS.bg,
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.4em" }}
            animate={{ opacity: 1, letterSpacing: "0.05em" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: COLORS.text }}
          >
            DuoKarma
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ height: 1, background: COLORS.accent, marginTop: 18 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}`,
    'Nav.tsx': `import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from './ui/theme';
import { MagneticButton } from './ui/MagneticButton';

export function Nav() {
  const [open, setOpen] = useState(false);
  const links = ["Work", "Services", "Process", "Contact"];
  return (
    <>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 5%",
          background: "linear-gradient(to bottom, rgba(10,9,8,0.85), transparent)",
          backdropFilter: "blur(2px)",
        }}
      >
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 20,
            letterSpacing: "0.02em",
            color: COLORS.text,
          }}
        >
          DuoKarma
        </div>
        <div style={{ display: "flex", gap: 36 }} className="dk-nav-links">
          {links.map((l) => (
            <a
              key={l}
              href={\`#\${l.toLowerCase()}\`}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: COLORS.secondary,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              {l}
            </a>
          ))}
        </div>
        <div className="dk-nav-cta">
          <MagneticButton primary onClick={() => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}>Book a call</MagneticButton>
        </div>
      </motion.nav>
      <style>{\`
        @media (max-width: 720px) {
          .dk-nav-links { display: none !important; }
        }
      \`}</style>
    </>
  );
}`,
    'Hero.tsx': `import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { MagneticButton } from './ui/MagneticButton';

function Panel({ position, rotation, scale = 1, color = COLORS.accent, speed = 1 }: any) {
  const ref = useRef<THREE.Mesh>(null!);
  const seed = useMemo(() => Math.random() * 100, []);
  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime() * speed + seed;
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(t * 0.6) * 0.18;
    ref.current.rotation.x = rotation[0] + mouse.y * 0.15;
    ref.current.rotation.y = rotation[1] + mouse.x * 0.25 + Math.sin(t * 0.3) * 0.05;
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1.6, 1, 1]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.08}
        roughness={0.2}
        metalness={0.3}
        transmission={0.6}
        thickness={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Rays() {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.02;
  });
  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, 0.4]} position={[0, 0, -3]}>
        <planeGeometry args={[12, 0.4]} />
        <meshBasicMaterial color={COLORS.accent} transparent opacity={0.04} />
      </mesh>
      <mesh rotation={[0, 0, -0.3]} position={[1, -1, -3]}>
        <planeGeometry args={[14, 0.3]} />
        <meshBasicMaterial color={COLORS.accent} transparent opacity={0.03} />
      </mesh>
    </group>
  );
}

function CameraRig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.02;
    camera.position.y += (mouse.y * 0.35 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 2, 4]} intensity={1.2} color={COLORS.accent2} />
      <pointLight position={[-3, -1, 2]} intensity={0.5} color={COLORS.emerald} />
      <Suspense fallback={null}>
        <Panel position={[-1.4, 0.4, -1]} rotation={[0.1, 0.4, 0]} scale={1.1} speed={0.8} />
        <Panel position={[1.5, -0.3, -1.5]} rotation={[-0.15, -0.3, 0.1]} scale={0.9} color={COLORS.emerald} speed={1.1} />
        <Panel position={[0.2, 0.9, -2]} rotation={[0.2, 0.1, -0.1]} scale={0.7} speed={0.6} />
        <Panel position={[-0.6, -0.9, -0.5]} rotation={[-0.05, 0.2, 0.05]} scale={0.6} speed={1.3} />
        <Rays />
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}

export function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);
  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 640,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <HeroScene />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 0%, rgba(10,9,8,0.4) 60%, rgba(10,9,8,0.95) 100%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 20px" }}>
        <AnimatePresence>
          {loaded && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Eyebrow>
                  <span style={{ margin: "0 auto" }} />
                </Eyebrow>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 400,
                  fontSize: "clamp(38px, 6.2vw, 84px)",
                  lineHeight: 1.05,
                  color: COLORS.text,
                  maxWidth: 900,
                  margin: "0 auto",
                }}
              >
                We build software
                <br />
                businesses <em style={{ color: COLORS.accent, fontStyle: "italic" }}>actually use.</em>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.35 }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 16,
                  color: COLORS.secondary,
                  maxWidth: 480,
                  margin: "22px auto 36px",
                  lineHeight: 1.6,
                }}
              >
                DuoKarma designs and builds custom dashboards, booking platforms, and
                business systems — the kind that replace spreadsheets, not decorate a homepage.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ display: "flex", gap: 14, justifyContent: "center" }}
              >
                <MagneticButton primary onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}>Book free consultation</MagneticButton>
                <MagneticButton onClick={() => {
                  document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
                }}>See our work</MagneticButton>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.15em",
          color: COLORS.secondary,
          textTransform: "uppercase",
        }}
      >
        Scroll
      </motion.div>
    </section>
  );
}`,
    'About.tsx': `import React from 'react';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

const TIMELINE = [
  { label: "Idea", text: "A founder describes the business problem — no code yet, just chaos to untangle." },
  { label: "Planning", text: "We map data, roles, and workflows into a system architecture that will hold up." },
  { label: "Development", text: "Real components, real state, real interactions — built to survive daily use." },
  { label: "Deployment", text: "Shipped, monitored, and handed over with documentation your team can act on." },
  { label: "Growth", text: "Systems evolve with the business — new modules, not new rewrites." },
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
            marginBottom: 90,
          }}
        >
          Two people, one discipline: build the software a business will still be running in five years.
        </h2>
      </Reveal>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 0,
          borderTop: \`1px solid \${COLORS.line}\`,
        }}
      >
        {TIMELINE.map((step, i) => (
          <Reveal delay={i * 0.08} key={step.label}>
            <div
              style={{
                borderRight: i < TIMELINE.length - 1 ? \`1px solid \${COLORS.line}\` : "none",
                padding: "28px 20px 0",
                minHeight: 180,
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: COLORS.accent,
                  marginBottom: 12,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 19,
                  color: COLORS.text,
                  marginBottom: 10,
                }}
              >
                {step.label}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: COLORS.secondary, lineHeight: 1.6 }}>
                {step.text}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}`,
    'WhatWeBuild.tsx': `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

const MODULES = [
  { name: "Salon Management", detail: "Appointments, staff schedules, service menus, and client history in one live system." },
  { name: "Farmhouse Booking", detail: "Public booking engine with availability calendars, pricing rules, and instant confirmations." },
  { name: "Business Dashboards", detail: "Real-time views into revenue, bookings, and operations — built around how owners actually check numbers." },
  { name: "CRM Systems", detail: "Track leads, clients, and follow-ups without a spreadsheet duct-taped to email." },
  { name: "Inventory & Billing", detail: "Stock levels, invoicing, and POS flows that stay in sync with what's actually sold." },
  { name: "Business Automation", detail: "Notifications, reminders, and workflows that remove the manual middle step." },
];

export function WhatWeBuild() {
  const [active, setActive] = useState(0);
  return (
    <section style={{ padding: "140px 5%", background: COLORS.surface }} id="work">
      <Reveal>
        <Eyebrow>What we build</Eyebrow>
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
          Six kinds of systems, one build quality.
        </h2>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 50 }} className="dk-modules-grid">
        <div>
          {MODULES.map((m, i) => (
            <div
              key={m.name}
              onMouseEnter={() => setActive(i)}
              style={{
                padding: "22px 0",
                borderBottom: \`1px solid \${COLORS.line}\`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 22,
                  color: active === i ? COLORS.accent : COLORS.text,
                  transition: "color 0.3s",
                }}
              >
                {m.name}
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: COLORS.secondary,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
        <div style={{ position: "relative", minHeight: 220 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4 }}
              style={{
                background: COLORS.surface2,
                border: \`1px solid \${COLORS.line}\`,
                borderRadius: 16,
                padding: 32,
              }}
            >
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: COLORS.accent, marginBottom: 14 }}>
                {MODULES[active].name}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: COLORS.secondary, lineHeight: 1.7 }}>
                {MODULES[active].detail}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <style>{\`
        @media (max-width: 760px) {
          .dk-modules-grid { grid-template-columns: 1fr !important; }
        }
      \`}</style>
    </section>
  );
}`,
    'Showcase.tsx': `import React, { useState, useEffect } from 'react';
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
          border: \`1px solid \${COLORS.line}\`,
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
              <div style={{ paddingTop: 26, borderTop: \`1px solid \${COLORS.line}\`, marginTop: 26 }}>
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
                        border: \`1px solid \${COLORS.line}\`,
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
        {projects.map((p, i) => (
          <ProjectCard project={p} index={i} key={p.title} />
        ))}
      </div>
    </section>
  );
}`,
    'Services.tsx': `import React from 'react';
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
                border: \`1px solid \${COLORS.line}\`,
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
}`,
    'Process.tsx': `import React from 'react';
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
}`,
    'TechStack.tsx': `import React from 'react';
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
                border: \`1px solid \${COLORS.line}\`,
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
}`,
    'Stats.tsx': `import React, { useState, useEffect, useRef } from 'react';
import { COLORS } from './ui/theme';

function Counter({ to, suffix = "" }: { to: number, suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const duration = 1400;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setVal(Math.round(eased * to));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, started]);

  return (
    <div ref={ref} style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(40px, 5vw, 64px)", color: COLORS.accent }}>
      {val}
      {suffix}
    </div>
  );
}

export function Stats() {
  const stats = [
    { to: 5, label: "Projects built" },
    { to: 4, label: "Businesses served" },
    { to: 30, suffix: "+", label: "Features developed" },
    { to: 18, label: "Modules created" },
  ];
  return (
    <section style={{ padding: "120px 5%", background: COLORS.bg, borderTop: \`1px solid \${COLORS.line}\`, borderBottom: \`1px solid \${COLORS.line}\` }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 30 }}>
        {stats.map((s) => (
          <div key={s.label}>
            <Counter to={s.to} suffix={s.suffix} />
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: COLORS.secondary, marginTop: 8 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}`,
    'EarlyPartners.tsx': `import React from 'react';
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
}`,
    'CTA.tsx': `import React from 'react';
import { COLORS } from './ui/theme';
import { Reveal } from './ui/Reveal';
import { MagneticButton } from './ui/MagneticButton';

export function CTA() {
  return (
    <section
      style={{
        padding: "160px 5%",
        background: \`radial-gradient(circle at 50% 30%, \${COLORS.surface2} 0%, \${COLORS.bg} 70%)\`,
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
}`,
    'Contact.tsx': `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';
import { supabase } from '@/lib/supabase';

const CONTACT_CARDS = [
  { label: "Google Meet", value: "Schedule a call" },
  { label: "WhatsApp", value: "Message us directly" },
  { label: "Email", value: "hello@duokarma.com" },
  { label: "LinkedIn", value: "@duokarma" },
];

export function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('leads').insert({
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        company: formData.company || 'Website Inquiry',
        source: 'Website',
        value: 0,
        stage: 'new',
        probability: 10,
        assignedTo: 'Unassigned',
        createdDate: new Date().toISOString().split('T')[0],
        lastContact: new Date().toISOString().split('T')[0]
      });
      setSuccess(true);
      setFormData({ name: '', email: '', company: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        
        <Reveal delay={0.1}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input 
              required
              placeholder="Your Name" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ padding: '16px 20px', borderRadius: 12, background: COLORS.surface, border: \`1px solid \${COLORS.line}\`, color: COLORS.text, fontFamily: "'Inter', sans-serif", outline: 'none' }} 
            />
            <input 
              required
              type="email"
              placeholder="Your Email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              style={{ padding: '16px 20px', borderRadius: 12, background: COLORS.surface, border: \`1px solid \${COLORS.line}\`, color: COLORS.text, fontFamily: "'Inter', sans-serif", outline: 'none' }} 
            />
            <input 
              placeholder="Company Name (Optional)" 
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              style={{ padding: '16px 20px', borderRadius: 12, background: COLORS.surface, border: \`1px solid \${COLORS.line}\`, color: COLORS.text, fontFamily: "'Inter', sans-serif", outline: 'none' }} 
            />
            <textarea 
              required
              placeholder="Tell us about your project" 
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              rows={4}
              style={{ padding: '16px 20px', borderRadius: 12, background: COLORS.surface, border: \`1px solid \${COLORS.line}\`, color: COLORS.text, fontFamily: "'Inter', sans-serif", outline: 'none', resize: 'vertical' }} 
            />
            <button 
              type="submit"
              disabled={loading}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                padding: "16px 30px",
                borderRadius: 12,
                border: "none",
                background: COLORS.accent,
                color: "#15130F",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
            <AnimatePresence>
              {success && (
                <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={{ color: COLORS.emerald, fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
                  Message sent successfully! We'll be in touch soon.
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, alignContent: 'start' }}>
          {CONTACT_CARDS.map((c, i) => (
            <Reveal delay={i * 0.06} key={c.label}>
              <motion.div
                whileHover={{ y: -4, borderColor: COLORS.accent }}
                style={{
                  border: \`1px solid \${COLORS.line}\`,
                  borderRadius: 16,
                  padding: 26,
                  background: COLORS.surface,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  {c.label}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: COLORS.text }}>{c.value}</div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    'Footer.tsx': `import React from 'react';
import { COLORS } from './ui/theme';

export function Footer() {
  return (
    <footer
      style={{
        padding: "34px 5%",
        borderTop: \`1px solid \${COLORS.line}\`,
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, color: COLORS.secondary }}>DuoKarma © 2026</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: COLORS.secondary }}>
        Built by DuoKarma, obviously.
      </div>
    </footer>
  );
}`,
};

for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(landingDir, name), content, 'utf8');
}
console.log('Successfully wrote landing components');
