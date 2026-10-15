import { useState } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';
import { CaseStudySheet } from './CaseStudySheet';

const PROJECTS = [
  {
    id: 'salon-admin',
    title: 'Salon Admin Platform',
    category: 'Admin System',
    size: 'large',
    problem: 'Three salons were running bookings across phone calls, WhatsApp, and paper registers — no shared view of the day.',
    solution: 'A unified admin panel covering appointments, staff schedules, billing, and client history, live across every location.',
    result: 'One dashboard replaced three systems. The owner gained full real-time visibility across all locations.',
    features: ['Live appointment calendar', 'Staff & service management', 'Client history & billing', 'Role-based access'],
    tech: ['React', 'Supabase', 'TypeScript'],
    color: COLORS.accent,
    accentBg: 'rgba(197,164,109,0.08)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
  {
    id: 'farmhouse-booking',
    title: 'Farmhouse Booking',
    category: 'Booking Platform',
    size: 'small',
    problem: 'A weekend-farmhouse rental had no way to show availability or take bookings without back-and-forth calls.',
    solution: 'A public booking site with a live calendar, transparent pricing, and instant confirmation.',
    result: 'Bookings moved fully online, eliminating all manual coordination and phone-tag.',
    features: ['Live availability calendar', 'Dynamic pricing rules', 'Instant confirmation', 'Mobile-first design'],
    tech: ['React', 'Supabase'],
    color: COLORS.accent,
    accentBg: 'rgba(197,164,109,0.08)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'farmhouse-admin',
    title: 'Farmhouse Dashboard',
    category: 'Admin Dashboard',
    size: 'small',
    problem: 'The owner needed to manage bookings, blackout dates, and revenue without touching a spreadsheet.',
    solution: 'A companion admin dashboard synced to the booking site, giving a real-time operational view of the property.',
    result: 'Full operational control from a single screen. Zero spreadsheets.',
    features: ['Booking & revenue overview', 'Blackout date management', 'Guest communication log', 'Supabase-backed sync'],
    tech: ['React', 'Supabase', 'TypeScript'],
    color: COLORS.accent,
    accentBg: 'rgba(197,164,109,0.08)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: 'salon-website',
    title: 'Salon Website',
    category: 'Business Website',
    size: 'wide',
    problem: 'The salon needed a digital presence to showcase services, interior, and allow clients to book online.',
    solution: 'A modern, responsive website with service menus, gallery, and booking system integration.',
    result: 'A premium online presence that converts visitors to bookings directly.',
    features: ['Service menu', 'Photo gallery', 'Online booking', 'Mobile-responsive'],
    tech: ['React', 'Tailwind CSS'],
    color: COLORS.accent,
    accentBg: 'rgba(197,164,109,0.08)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
];

export function Showcase() {
  const [selected, setSelected] = useState<typeof PROJECTS[0] | null>(null);

  return (
    <section
      id="work"
      style={{ padding: '140px 5%', background: COLORS.bg }}
    >
      <div className="max-w-[1200px] mx-auto">
        <Reveal>
          <Eyebrow>Selected work</Eyebrow>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              fontSize: 'clamp(28px, 3.6vw, 46px)',
              color: COLORS.text,
              marginBottom: 56,
              maxWidth: 520,
              lineHeight: 1.15,
            }}
          >
            Real systems, running in production.
          </h2>
        </Reveal>

        {/* Bento Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 20,
          }}
          className="bento-grid"
        >
          {/* Large card — col 1-7 */}
          <BentoCard
            project={PROJECTS[0]}
            style={{ gridColumn: 'span 7' }}
            onOpen={() => setSelected(PROJECTS[0])}
          />
          {/* Small card — col 8-12 */}
          <BentoCard
            project={PROJECTS[1]}
            style={{ gridColumn: 'span 5' }}
            onOpen={() => setSelected(PROJECTS[1])}
          />
          {/* Small card — col 1-5 */}
          <BentoCard
            project={PROJECTS[2]}
            style={{ gridColumn: 'span 5' }}
            onOpen={() => setSelected(PROJECTS[2])}
          />
          {/* Wide card — col 6-12 */}
          <BentoCard
            project={PROJECTS[3]}
            style={{ gridColumn: 'span 7' }}
            onOpen={() => setSelected(PROJECTS[3])}
          />
        </div>

        {/* Responsive fallback for mobile */}
        <style>{`
          @media (max-width: 768px) {
            .bento-grid { grid-template-columns: 1fr !important; }
            .bento-grid > * { grid-column: span 1 !important; }
          }
        `}</style>

        <AnimatePresence>
          {selected && (
            <CaseStudySheet project={selected} onClose={() => setSelected(null)} />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function BentoCard({
  project,
  style,
  onOpen,
}: {
  project: typeof PROJECTS[0];
  style?: React.CSSProperties;
  onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onOpen}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      style={{
        ...style,
        background: COLORS.card,
        border: `1px solid ${hovered ? '#3A372E' : COLORS.line}`,
        borderRadius: 20,
        padding: '36px 32px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 200,
        transition: 'border-color 0.25s ease',
        boxShadow: hovered ? '0 12px 30px rgba(0,0,0,0.45)' : 'none',
      }}
      data-cursor="View"
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(197,164,109,0.08)',
              border: `1px solid rgba(197,164,109,0.2)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.accent,
            }}
          >
            {project.icon}
          </div>
          <motion.div
            animate={{ opacity: hovered ? 1 : 0.35, x: hovered ? 0 : 3 }}
            transition={{ duration: 0.2 }}
            style={{ color: COLORS.accent }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </motion.div>
        </div>

        {/* Category pill */}
        <div
          style={{
            display: 'inline-block',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: COLORS.accent,
            background: 'rgba(197,164,109,0.08)',
            border: `1px solid rgba(197,164,109,0.2)`,
            borderRadius: 999,
            padding: '3px 10px',
            marginBottom: 12,
          }}
        >
          {project.category}
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(18px, 1.8vw, 24px)',
            color: COLORS.text,
            fontWeight: 400,
            marginBottom: 10,
            lineHeight: 1.25,
          }}
        >
          {project.title}
        </h3>

        {/* Problem */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13.5,
            color: COLORS.secondary,
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          {project.problem}
        </p>

        {/* Tech pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {project.tech.map((t) => (
            <span
              key={t}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 999,
                border: `1px solid ${COLORS.line}`,
                color: COLORS.secondary,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
