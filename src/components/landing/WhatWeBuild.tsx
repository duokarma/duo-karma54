import { useState, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
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
  { name: "Gym Management", detail: "Member subscriptions, class scheduling, and automated billing for fitness centers." },
  { name: "Clinic Management", detail: "Patient records, appointment scheduling, secure billing, and automated reminders." },
  { name: "Restaurant Systems", detail: "Table reservations, digital menus, order management, and seamless POS integration." },
];

export function WhatWeBuild() {
  const [active, setActive] = useState<number | null>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <section style={{ padding: "140px 5%", background: COLORS.surface }} id="work">
      <Reveal>
        <div className="max-w-[1200px] mx-auto">
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
            Nine kinds of systems, one build quality.
          </h2>
        </div>
      </Reveal>

      <div className="max-w-[1200px] mx-auto w-full relative">
        {MODULES.map((m, i) => (
          <div
            key={m.name}
            onMouseEnter={() => !isMobile && setActive(i)}
            onClick={() => isMobile && setActive(active === i ? null : i)}
            style={{
              borderBottom: `1px solid ${COLORS.line}`,
              position: "relative",
              cursor: "pointer"
            }}
          >
            <div
              style={{
                padding: "24px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: isMobile ? "100%" : "45%",
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

            {/* Desktop Description Panel — only rendered on desktop */}
            {!isMobile && (
              <AnimatePresence>
                {active === i && (
                  <motion.div
                    initial={{ opacity: 0, y: "-50%", x: 14 }}
                    animate={{ opacity: 1, y: "-50%", x: 0 }}
                    exit={{ opacity: 0, y: "-50%", x: 14 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: 0,
                      width: "48%",
                      background: COLORS.surface2,
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: 16,
                      padding: 32,
                      zIndex: 10,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                      pointerEvents: "none",
                    }}
                  >
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: COLORS.accent, marginBottom: 14 }}>
                      {m.name}
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: COLORS.secondary, lineHeight: 1.7 }}>
                      {m.detail}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Mobile Accordion — only rendered on mobile */}
            {isMobile && (
              <AnimatePresence initial={false}>
                {active === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ paddingBottom: 24 }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: COLORS.secondary, lineHeight: 1.7 }}>
                        {m.detail}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
