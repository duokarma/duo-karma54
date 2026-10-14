import { useState, useEffect, useRef } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';
import { CaseStudySheet } from './CaseStudySheet';
import { ArrowUpRight } from 'lucide-react';

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
    gradient: 'linear-gradient(135deg, rgba(201,168,118,0.15) 0%, rgba(201,168,118,0.04) 100%)',
    accentBg: 'rgba(201,168,118,0.12)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    color: '#86EFAC',
    gradient: 'linear-gradient(135deg, rgba(134,239,172,0.15) 0%, rgba(134,239,172,0.04) 100%)',
    accentBg: 'rgba(134,239,172,0.12)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    color: COLORS.accent2,
    gradient: 'linear-gradient(135deg, rgba(232,207,160,0.15) 0%, rgba(232,207,160,0.04) 100%)',
    accentBg: 'rgba(232,207,160,0.12)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: 'salon-website',
    title: 'Salon Website & Brand',
    category: 'Business Website',
    size: 'wide',
    problem: 'The salon needed a digital presence to showcase services, interior, and allow clients to book online.',
    solution: 'A modern, responsive website with service menus, gallery, and booking system integration.',
    result: 'A premium online presence that converts visitors to bookings directly.',
    features: ['Service menu', 'Photo gallery', 'Online booking', 'Mobile-responsive'],
    tech: ['React', 'Tailwind CSS'],
    color: '#93C5FD',
    gradient: 'linear-gradient(135deg, rgba(147,197,253,0.15) 0%, rgba(147,197,253,0.04) 100%)',
    accentBg: 'rgba(147,197,253,0.12)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
];

export function Showcase() {
  const [selected, setSelected] = useState<typeof PROJECTS[0] | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.offsetWidth * 0.85;
    const index = Math.round(scrollRef.current.scrollLeft / cardWidth);
    setMobileIndex(Math.min(Math.max(index, 0), PROJECTS.length - 1));
  };

  return (
    <section
      id="showcase"
      className="relative overflow-hidden py-16 md:py-32 px-5 md:px-[5%]"
      style={{ background: COLORS.bg }}
    >
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] opacity-30"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(201,168,118,0.15), transparent 75%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1200px] mx-auto">
        <Reveal>
          <div className="mb-10 md:mb-14">
            <Eyebrow>Selected work</Eyebrow>
            <h2
              className="text-3xl md:text-5xl font-normal tracking-tight max-w-[600px] mt-2"
              style={{
                fontFamily: "'Fraunces', serif",
                background: 'linear-gradient(135deg, #FFFFFF 20%, #F5E6CC 60%, #C9A876 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Real systems, running in production.
            </h2>
            <p className="text-sm md:text-base text-ink/60 mt-3 max-w-[500px] leading-relaxed">
              Explore how we transformed disconnected workflows into fast, cohesive digital platforms.
            </p>
          </div>
        </Reveal>

        {/* ── MOBILE: Horizontal Flagship Showcase ── */}
        {isMobile ? (
          <div className="relative -mx-5 px-5">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 px-5 -mx-5 scrollbar-none"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
            >
              {PROJECTS.map((project) => (
                <motion.div
                  key={project.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(project)}
                  className="snap-center shrink-0 w-[86vw] max-w-[340px] rounded-3xl p-6 relative overflow-hidden transition-all"
                  style={{
                    background: 'linear-gradient(145deg, rgba(26, 23, 20, 0.9) 0%, rgba(12, 11, 10, 0.98) 100%)',
                    border: '1px solid rgba(201, 168, 118, 0.22)',
                    boxShadow: '0 16px 40px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center border"
                      style={{
                        background: project.accentBg,
                        borderColor: `${project.color}35`,
                        color: project.color,
                      }}
                    >
                      {project.icon}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#C9A876] font-medium bg-[#C9A876]/10 px-2.5 py-1 rounded-full border border-[#C9A876]/25">
                      <span>View Case Study</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Category Pill */}
                  <span
                    className="inline-block text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full mb-2 border"
                    style={{
                      background: project.accentBg,
                      borderColor: `${project.color}30`,
                      color: project.color,
                    }}
                  >
                    {project.category}
                  </span>

                  {/* Title */}
                  <h3
                    className="text-xl font-normal text-white mb-2"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {project.title}
                  </h3>

                  {/* Result Quote */}
                  <p className="text-xs text-ink/80 leading-relaxed font-sans mb-4 min-h-[48px]">
                    {project.result}
                  </p>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 text-ink/60 border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {PROJECTS.map((_, i) => (
                <span
                  key={i}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: mobileIndex === i ? 24 : 6,
                    background: mobileIndex === i ? '#C9A876' : 'rgba(255, 255, 255, 0.15)',
                  }}
                />
              ))}
            </div>
            <p className="text-center text-[11px] text-ink/40 mt-2 font-mono">
              Swipe to explore production work ({mobileIndex + 1}/{PROJECTS.length})
            </p>
          </div>
        ) : (
          /* ── DESKTOP: Bento Grid ── */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: 20,
            }}
          >
            <BentoCard
              project={PROJECTS[0]}
              style={{ gridColumn: 'span 7' }}
              onOpen={() => setSelected(PROJECTS[0])}
            />
            <BentoCard
              project={PROJECTS[1]}
              style={{ gridColumn: 'span 5' }}
              onOpen={() => setSelected(PROJECTS[1])}
            />
            <BentoCard
              project={PROJECTS[2]}
              style={{ gridColumn: 'span 5' }}
              onOpen={() => setSelected(PROJECTS[2])}
            />
            <BentoCard
              project={PROJECTS[3]}
              style={{ gridColumn: 'span 7' }}
              onOpen={() => setSelected(PROJECTS[3])}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <CaseStudySheet project={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
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
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      style={{
        ...style,
        background: hovered
          ? 'linear-gradient(145deg, rgba(34, 29, 24, 0.92) 0%, rgba(16, 14, 12, 0.98) 100%)'
          : 'linear-gradient(145deg, rgba(24, 21, 18, 0.8) 0%, rgba(12, 11, 10, 0.92) 100%)',
        border: hovered
          ? '1px solid rgba(201, 168, 118, 0.4)'
          : '1px solid rgba(201, 168, 118, 0.16)',
        borderRadius: 24,
        padding: '36px 32px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 220,
        transition: 'background 0.4s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: hovered
          ? '0 20px 48px -10px rgba(0,0,0,0.7), 0 0 20px rgba(201,168,118,0.1)'
          : '0 8px 24px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(16px)',
      }}
      data-cursor="View"
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: project.accentBg,
              border: `1px solid ${project.color}35`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: project.color,
            }}
          >
            {project.icon}
          </div>
          <motion.div
            animate={{ opacity: hovered ? 1 : 0.4, x: hovered ? 0 : 3, y: hovered ? 0 : -3 }}
            transition={{ duration: 0.25 }}
            style={{ color: project.color }}
          >
            <ArrowUpRight className="w-5 h-5" />
          </motion.div>
        </div>

        <div
          style={{
            display: 'inline-block',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: project.color,
            background: project.accentBg,
            border: `1px solid ${project.color}30`,
            borderRadius: 999,
            padding: '3px 10px',
            marginBottom: 12,
          }}
        >
          {project.category}
        </div>

        <h3
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(20px, 1.8vw, 26px)',
            color: COLORS.text,
            marginBottom: 10,
            fontWeight: 400,
          }}
        >
          {project.title}
        </h3>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: COLORS.secondary,
            lineHeight: 1.6,
            marginBottom: 20,
            maxWidth: 480,
          }}
        >
          {project.result}
        </p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {project.tech.map((t) => (
            <span
              key={t}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: 'rgba(255,255,255,0.45)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 6,
                padding: '3px 8px',
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
