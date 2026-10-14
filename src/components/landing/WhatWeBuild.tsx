import { useState, useEffect, useRef } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';
import { ChevronRight } from 'lucide-react';

const MODULES = [
  {
    name: "Salon Management",
    tag: "Multi-Location",
    detail: "Appointments, staff schedules, service menus, and client history in one live system.",
    icon: "✂️",
  },
  {
    name: "Farmhouse Booking",
    tag: "Hospitality",
    detail: "Public booking engine with availability calendars, pricing rules, and instant confirmations.",
    icon: "🏡",
  },
  {
    name: "Business Dashboards",
    tag: "Executive Analytics",
    detail: "Real-time views into revenue, bookings, and operations — built around how owners actually check numbers.",
    icon: "📊",
  },
  {
    name: "CRM Systems",
    tag: "Client Pipelines",
    detail: "Track leads, clients, and follow-ups without a spreadsheet duct-taped to email.",
    icon: "🎯",
  },
  {
    name: "Inventory & Billing",
    tag: "Commerce & POS",
    detail: "Stock levels, invoicing, and POS flows that stay in sync with what's actually sold.",
    icon: "📦",
  },
  {
    name: "Business Automation",
    tag: "Workflow Engine",
    detail: "Notifications, reminders, and workflows that remove the manual middle step.",
    icon: "⚡",
  },
  {
    name: "Gym Management",
    tag: "Health & Fitness",
    detail: "Member subscriptions, class scheduling, and automated billing for fitness centers.",
    icon: "💪",
  },
  {
    name: "Clinic Management",
    tag: "Healthcare",
    detail: "Patient records, appointment scheduling, secure billing, and automated reminders.",
    icon: "🩺",
  },
  {
    name: "Restaurant Systems",
    tag: "F&B Operations",
    detail: "Table reservations, digital menus, order management, and seamless POS integration.",
    icon: "🍽️",
  },
];

export function WhatWeBuild() {
  const [active, setActive] = useState<number | null>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleMobileScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = carouselRef.current.offsetWidth * 0.82;
    const index = Math.round(scrollLeft / cardWidth);
    setMobileActiveIndex(Math.min(Math.max(index, 0), MODULES.length - 1));
  };

  return (
    <section
      className="relative overflow-hidden py-16 md:py-36 px-5 md:px-[5%]"
      style={{ background: COLORS.surface }}
      id="work"
    >
      {/* Ambient luxury radial glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-40"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,168,118,0.18), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <Reveal>
        <div className="max-w-[1200px] mx-auto mb-10 md:mb-16">
          <Eyebrow>What we build</Eyebrow>
          <h2
            className="text-3xl md:text-5xl font-normal tracking-tight max-w-[640px] mt-2"
            style={{
              fontFamily: "'Fraunces', serif",
              background: 'linear-gradient(135deg, #FFFFFF 20%, #F5E6CC 60%, #C9A876 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Nine kinds of systems, one build quality.
          </h2>
          <p className="text-sm md:text-base text-ink/60 mt-3 max-w-[540px] leading-relaxed">
            Every product is custom engineered from scratch for peak operational speed, bank-grade reliability, and memorable aesthetics.
          </p>
        </div>
      </Reveal>

      {/* ── MOBILE: Sleek Horizontal Snap-Carousel ── */}
      {isMobile ? (
        <div className="relative -mx-5 px-5">
          <div
            ref={carouselRef}
            onScroll={handleMobileScroll}
            className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 px-5 -mx-5 scrollbar-none"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
          >
            {MODULES.map((m, i) => (
              <motion.div
                key={m.name}
                whileTap={{ scale: 0.98 }}
                className="snap-center shrink-0 w-[84vw] max-w-[320px] rounded-2xl p-6 relative overflow-hidden transition-all"
                style={{
                  background: 'linear-gradient(145deg, rgba(28, 25, 22, 0.85) 0%, rgba(12, 11, 10, 0.95) 100%)',
                  border: mobileActiveIndex === i ? '1px solid rgba(201, 168, 118, 0.45)' : '1px solid rgba(201, 168, 118, 0.14)',
                  boxShadow: mobileActiveIndex === i ? '0 12px 35px -8px rgba(201,168,118,0.12)' : '0 8px 24px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                {/* Top Badge Row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{m.icon}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-[#C9A876]/10 text-[#C9A876] border border-[#C9A876]/25">
                      {m.tag}
                    </span>
                    <span
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      className="text-[11px] text-ink/40 font-mono"
                    >
                      0{i + 1}
                    </span>
                  </div>
                </div>

                {/* System Title */}
                <h3
                  className="text-xl font-normal text-white mb-2"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {m.name}
                </h3>

                {/* Detail Description */}
                <p className="text-xs text-ink/70 leading-relaxed font-sans mb-4 min-h-[50px]">
                  {m.detail}
                </p>

                {/* Bottom link indicator */}
                <div className="flex items-center gap-1.5 text-xs text-[#C9A876] font-medium pt-2 border-t border-white/5">
                  <span>Custom engineered</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {MODULES.map((_, i) => (
              <span
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: mobileActiveIndex === i ? 22 : 6,
                  background: mobileActiveIndex === i ? '#C9A876' : 'rgba(255, 255, 255, 0.15)',
                }}
              />
            ))}
          </div>
          <p className="text-center text-[11px] text-ink/40 mt-2 font-mono">
            Swipe to explore systems ({mobileActiveIndex + 1}/{MODULES.length})
          </p>
        </div>
      ) : (
        /* ── DESKTOP: Interactive list with floating preview drawer ── */
        <div className="max-w-[1200px] mx-auto w-full relative">
          {MODULES.map((m, i) => (
            <div
              key={m.name}
              onMouseEnter={() => setActive(i)}
              style={{
                borderBottom: `1px solid ${COLORS.line}`,
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  padding: '26px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '45%',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg opacity-80">{m.icon}</span>
                  <span
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 22,
                      color: active === i ? COLORS.accent : COLORS.text,
                      transition: 'color 0.3s',
                    }}
                  >
                    {m.name}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    color: active === i ? COLORS.accent : COLORS.secondary,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Desktop Description Panel */}
              <AnimatePresence>
                {active === i && (
                  <motion.div
                    initial={{ opacity: 0, y: '-50%', x: 14 }}
                    animate={{ opacity: 1, y: '-50%', x: 0 }}
                    exit={{ opacity: 0, y: '-50%', x: 14 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: 0,
                      width: '48%',
                      background: 'linear-gradient(145deg, rgba(30, 26, 22, 0.9) 0%, rgba(14, 13, 11, 0.98) 100%)',
                      border: '1px solid rgba(201, 168, 118, 0.25)',
                      borderRadius: 20,
                      padding: 34,
                      zIndex: 10,
                      boxShadow: '0 24px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
                      pointerEvents: 'none',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        style={{
                          fontFamily: "'Fraunces', serif",
                          fontSize: 24,
                          color: COLORS.accent,
                        }}
                      >
                        {m.name}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C9A876]/10 text-[#C9A876] border border-[#C9A876]/30">
                        {m.tag}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 15,
                        color: COLORS.secondary,
                        lineHeight: 1.7,
                      }}
                    >
                      {m.detail}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
