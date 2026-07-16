import { useState } from 'react';
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
  { name: "Gym Management", detail: "Member subscriptions, class scheduling, and automated billing for fitness centers." },
  { name: "Clinic Management", detail: "Patient records, appointment scheduling, secure billing, and automated reminders." },
  { name: "Restaurant Systems", detail: "Table reservations, digital menus, order management, and seamless POS integration." },
];

export function WhatWeBuild() {
  const [active, setActive] = useState<number | null>(0);
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
          Nine kinds of systems, one build quality.
        </h2>
      </Reveal>
      <div style={{ display: "grid", gap: 50 }} className="dk-modules-grid">
        <div>
          {MODULES.map((m, i) => (
            <div key={m.name} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
              <div
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(active === i ? null : i)}
                style={{
                  padding: "22px 0",
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
              
              {/* Mobile Accordion Description */}
              <AnimatePresence>
                {active === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: "hidden" }}
                    className="mobile-description-panel"
                  >
                    <div style={{ paddingBottom: 22 }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: COLORS.secondary, lineHeight: 1.7 }}>
                        {m.detail}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Desktop Description Panel */}
        <div style={{ position: "relative", minHeight: 220 }} className="desktop-description-panel">
          <AnimatePresence mode="wait">
            {active !== null && (
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: COLORS.surface2,
                  border: `1px solid ${COLORS.line}`,
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
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`
        .dk-modules-grid { grid-template-columns: minmax(0,1fr) minmax(0,1fr); }
        .mobile-description-panel { display: none; }
        
        @media (max-width: 760px) {
          .dk-modules-grid { grid-template-columns: 1fr; gap: 0 !important; }
          .desktop-description-panel { display: none; }
          .mobile-description-panel { display: block; }
        }
      `}</style>
    </section>
  );
}