import { useState } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

const SERVICES = [
  { name: 'Custom Software', icon: '⌨', description: 'Bespoke applications built around your exact workflow.' },
  { name: 'Admin Dashboards', icon: '◫', description: 'Real-time control panels for operations and analytics.' },
  { name: 'Booking Platforms', icon: '◷', description: 'Availability-aware booking with instant confirmation.' },
  { name: 'Business Automation', icon: '⚡', description: 'Eliminate repetitive tasks with intelligent workflows.' },
  { name: 'Business Websites', icon: '◈', description: 'Premium public-facing sites that convert visitors.' },
  { name: 'Cloud Deployment', icon: '☁', description: 'Zero-downtime releases with CDN, SSL, and monitoring.' },
  { name: 'Supabase Integration', icon: '◉', description: 'Real-time data, auth, and storage — production-ready.' },
  { name: 'Responsive Design', icon: '◻', description: 'Every screen, every device — pixel-perfect.' },
];

export function Services() {
  return (
    <section style={{ padding: '140px 5%', background: COLORS.surface }} id="services">
      <Reveal>
        <Eyebrow>Services</Eyebrow>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: 'clamp(28px, 3.6vw, 46px)',
            color: COLORS.text,
            marginBottom: 60,
            maxWidth: 500,
          }}
        >
          What you can hand us.
        </h2>
      </Reveal>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
        }}
      >
        {SERVICES.map((s, i) => (
          <Reveal delay={i * 0.05} key={s.name}>
            <ServiceCard service={s} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: typeof SERVICES[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4, rotate: 0.4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{
        border: `1px solid ${hovered ? 'rgba(201,168,118,0.35)' : COLORS.line}`,
        borderRadius: 16,
        padding: '24px 22px',
        background: hovered ? 'rgba(201,168,118,0.05)' : COLORS.surface2,
        transition: 'background 0.3s ease, border-color 0.3s ease',
        cursor: 'default',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.2)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 22,
          color: hovered ? COLORS.accent : COLORS.secondary,
          marginBottom: 14,
          transition: 'color 0.3s ease',
          lineHeight: 1,
        }}
      >
        {service.icon}
      </div>

      {/* Name */}
      <div
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 17,
          color: COLORS.text,
          marginBottom: 8,
          lineHeight: 1.3,
        }}
      >
        {service.name}
      </div>

      {/* Description */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, height: hovered ? 'auto' : 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{ overflow: 'hidden' }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: COLORS.secondary,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {service.description}
        </p>
      </motion.div>

      {/* Subtle corner accent */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          bottom: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,118,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}