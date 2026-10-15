import { useState, useRef, useEffect, useCallback } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

interface SystemModule {
  id: string;
  name: string;
  category: string;
  detail: string;
  features: string[];
  mockup: {
    statusBadge: string;
    metricLabel: string;
    metricValue: string;
    subtext: string;
    rows: { label: string; value: string; active?: boolean }[];
  };
}

const MODULES: SystemModule[] = [
  {
    id: 'salon',
    name: 'Salon Management',
    category: 'Admin Platform',
    detail: 'Appointments, staff schedules, service menus, and client history in one live system.',
    features: ['Multi-Branch Sync', 'Stylist Commission Engine', 'Client Formula Ledger', 'WhatsApp Confirmations'],
    mockup: {
      statusBadge: 'LIVE DISPATCH',
      metricLabel: 'Stylists On Duty',
      metricValue: '8 Active',
      subtext: 'Station 02 • Balayage + Treatment in progress',
      rows: [
        { label: '11:30 AM', value: 'Balayage + Cut • Confirmed', active: true },
        { label: '01:15 PM', value: 'Keratin Touchup • Checked In', active: false },
        { label: '03:00 PM', value: 'Bridal Styling Trial • Scheduled', active: false },
      ],
    },
  },
  {
    id: 'farmhouse',
    name: 'Farmhouse Booking',
    category: 'Booking Engine',
    detail: 'Public booking engine with availability calendars, pricing rules, and instant confirmations.',
    features: ['Dynamic Weekend Pricing', 'Live Availability Matrix', 'Automated Gate Codes', 'Instant WhatsApp Receipts'],
    mockup: {
      statusBadge: 'CALENDAR SYNCED',
      metricLabel: 'Weekend Occupancy',
      metricValue: '100% Booked',
      subtext: 'Fri 16 — Sun 18 • Gate PIN #9042 Active',
      rows: [
        { label: 'Check-In', value: 'Fri 02:00 PM • Verified Guest', active: true },
        { label: 'Security Deposit', value: 'Pre-authorized via Gateway', active: false },
        { label: 'Gate Access', value: 'Automated SMS Dispatched', active: false },
      ],
    },
  },
  {
    id: 'dashboards',
    name: 'Business Dashboards',
    category: 'Executive Analytics',
    detail: 'Real-time views into revenue, bookings, and operations — built around how owners actually check numbers.',
    features: ['Real-Time P&L Metrics', 'Consolidated Bank Feeds', 'Multi-Entity Views', 'Automated Daily Briefs'],
    mockup: {
      statusBadge: 'TELEMETRY LIVE',
      metricLabel: 'Today Net Revenue',
      metricValue: '₹1,42,850',
      subtext: '+24.6% vs previous week across 3 branches',
      rows: [
        { label: 'Gross Bookings', value: '46 Transactions', active: true },
        { label: 'Expense Ratio', value: '18.4% of Target Cap', active: false },
        { label: 'Audit Trail', value: 'Zero Unreconciled Entries', active: false },
      ],
    },
  },
  {
    id: 'crm',
    name: 'CRM Systems',
    category: 'Client Pipelines',
    detail: 'Track leads, clients, and follow-ups without a spreadsheet duct-taped to email.',
    features: ['Visual Funnel Board', '1-Click WhatsApp Direct', 'Contact Auto-Enrichment', 'Stale-Deal Escalations'],
    mockup: {
      statusBadge: 'PIPELINE ACTIVE',
      metricLabel: 'Active Opportunities',
      metricValue: '34 Deals',
      subtext: 'Average closing cycle: 4.2 business days',
      rows: [
        { label: 'New Inquiries', value: '12 Qualified this week', active: true },
        { label: 'Proposal Sent', value: '6 Awaiting approval', active: false },
        { label: 'Closing Phase', value: '4 Ready for contract', active: false },
      ],
    },
  },
  {
    id: 'inventory',
    name: 'Inventory & Billing',
    category: 'Commerce & POS',
    detail: 'Stock levels, invoicing, and POS flows that stay in sync with what\'s actually sold.',
    features: ['Real-Time Stock Depletion', 'Instant GST E-Invoicing', 'Low-Stock Push Alerts', 'Vendor Purchase Orders'],
    mockup: {
      statusBadge: 'STOCK AUDITED',
      metricLabel: 'SKU Accuracy Rate',
      metricValue: '99.8%',
      subtext: 'Auto-depleting stock on POS settlement',
      rows: [
        { label: 'POS Terminal 01', value: 'Invoice #DK-2026-92 Issued', active: true },
        { label: 'GST Ledger', value: '18% IGST Automated Sync', active: false },
        { label: 'Reorder Buffer', value: '2 Items Flagged for Dispatch', active: false },
      ],
    },
  },
  {
    id: 'automation',
    name: 'Business Automation',
    category: 'Workflow Daemon',
    detail: 'Notifications, reminders, and workflows that remove the manual middle step.',
    features: ['Background Cron Daemons', 'Webhook Pipelines', 'Spreadsheet Auto-Ingestion', 'Self-Healing Queues'],
    mockup: {
      statusBadge: '0.8s EXECUTION',
      metricLabel: 'Weekly Hours Saved',
      metricValue: '18.5 hrs',
      subtext: 'Trigger → Webhook → DB → WhatsApp in 800ms',
      rows: [
        { label: 'Stripe Settlement', value: 'Auto-Reconciled to Books', active: true },
        { label: 'Client Notification', value: 'Instant Delivery Confirmed', active: false },
        { label: 'Error Fallback', value: '0 Failed Retries in 30 Days', active: false },
      ],
    },
  },
  {
    id: 'gym',
    name: 'Gym Management',
    category: 'Fitness Operations',
    detail: 'Member subscriptions, class scheduling, and automated billing for fitness centers.',
    features: ['Turnstile RFID Integration', 'Class Capacity Engine', 'Recurring Auto-Debit', 'Trainer Commission Split'],
    mockup: {
      statusBadge: 'GATES ONLINE',
      metricLabel: 'Active Memberships',
      metricValue: '482 Members',
      subtext: '94% on-time subscription auto-renewal',
      rows: [
        { label: 'Turnstile Entry', value: 'Member #189 Checked In', active: true },
        { label: 'HIIT Class', value: '18/20 Slots Reserved', active: false },
        { label: 'Auto-Debit', value: '14 Payments Processed', active: false },
      ],
    },
  },
  {
    id: 'clinic',
    name: 'Clinic Management',
    category: 'Healthcare Suite',
    detail: 'Patient records, appointment scheduling, secure billing, and automated reminders.',
    features: ['Encrypted Patient Vault', 'Live Token Queue Display', 'Digital Rx Generator', 'Diagnostic Lab Webhook'],
    mockup: {
      statusBadge: 'HIPAA ENCRYPTED',
      metricLabel: 'Queue Wait Time',
      metricValue: '< 6 mins',
      subtext: 'Zero paper records across consultation rooms',
      rows: [
        { label: 'Token #14', value: 'In Consultation Room 1', active: true },
        { label: 'Digital Rx', value: 'Sent to Patient Portal & SMS', active: false },
        { label: 'Lab Reports', value: 'Synced via Secure API', active: false },
      ],
    },
  },
  {
    id: 'restaurant',
    name: 'Restaurant Systems',
    category: 'F&B Operations',
    detail: 'Table reservations, digital menus, order management, and seamless POS integration.',
    features: ['Kitchen Display System (KDS)', 'Interactive Floor Plan', 'QR Self-Ordering Engine', 'Split-Bill POS Integration'],
    mockup: {
      statusBadge: 'KDS ONLINE',
      metricLabel: 'Table Turnaround',
      metricValue: '-22% Delay',
      subtext: 'Table 04 (6 Guests) • Main Course Dispatched',
      rows: [
        { label: 'Table 04', value: 'KDS Order #114 Fired', active: true },
        { label: 'Live Floor Map', value: '14/18 Tables Occupied', active: false },
        { label: 'Split Checkout', value: 'Card + UPI Settlement Done', active: false },
      ],
    },
  },
];

export function WhatWeBuild() {
  const [active, setActive] = useState<number>(0);
  const [mobileExpanded, setMobileExpanded] = useState<number | null>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [panelTop, setPanelTop] = useState(0);

  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Responsive breakpoint detector
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dynamically position the floating preview panel alongside the active row
  const updatePanelPosition = useCallback((index: number) => {
    const targetRow = rowRefs.current[index];
    const container = listContainerRef.current;
    if (targetRow && container) {
      const containerRect = container.getBoundingClientRect();
      const rowRect = targetRow.getBoundingClientRect();
      // Calculate row relative top inside container
      const relativeTop = rowRect.top - containerRect.top;
      // Clamp so panel never overflows bottom of container
      const maxTop = Math.max(0, containerRect.height - 420);
      setPanelTop(Math.min(maxTop, Math.max(0, relativeTop)));
    }
  }, []);

  useEffect(() => {
    if (!isMobile) {
      updatePanelPosition(active);
    }
  }, [active, isMobile, updatePanelPosition]);

  const handleSelect = (index: number) => {
    setActive(index);
    if (isMobile) {
      setMobileExpanded(mobileExpanded === index ? null : index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (index + 1) % MODULES.length;
      handleSelect(next);
      rowRefs.current[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (index - 1 + MODULES.length) % MODULES.length;
      handleSelect(prev);
      rowRefs.current[prev]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(index);
    }
  };

  const activeModule = MODULES[active] || MODULES[0];

  return (
    <section
      id="work"
      style={{
        background: COLORS.bg,
        padding: '140px 5%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="max-w-[1240px] mx-auto w-full">
        {/* Section Heading */}
        <Reveal>
          <div style={{ marginBottom: 64 }}>
            <Eyebrow>What we build</Eyebrow>
            <h2
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 400,
                fontSize: 'clamp(32px, 4vw, 54px)',
                color: COLORS.text,
                lineHeight: 1.15,
                marginTop: 16,
                maxWidth: 680,
              }}
            >
              Nine kinds of systems, one build quality.
            </h2>
          </div>
        </Reveal>

        {/* Two-Column Interactive Layout Container */}
        <div
          ref={listContainerRef}
          className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start"
          style={{ minHeight: 700 }}
        >
          {/* Left Column (7 cols): Spacious Vertical List */}
          <div
            className="lg:col-span-7 flex flex-col"
            style={{ borderTop: `1px solid ${COLORS.line}` }}
            role="tablist"
            aria-label="Nine kinds of systems"
          >
            {MODULES.map((m, i) => {
              const isActive = active === i;
              const formattedNumber = String(i + 1).padStart(2, '0');
              const isExpandedOnMobile = mobileExpanded === i;

              return (
                <div
                  key={m.id}
                  style={{ borderBottom: `1px solid ${COLORS.line}` }}
                  className="group relative"
                >
                  {/* Service Row Button */}
                  <button
                    ref={(el) => {
                      rowRefs.current[i] = el;
                    }}
                    id={`whatwebuild-item-${i}`}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={0}
                    onClick={() => handleSelect(i)}
                    onMouseEnter={() => {
                      if (!isMobile) {
                        setActive(i);
                      }
                    }}
                    onFocus={() => {
                      if (!isMobile) {
                        setActive(i);
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="w-full flex items-center justify-between text-left transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A46D] rounded-sm"
                    style={{
                      padding: '28px 8px',
                      background: 'transparent',
                      border: 'none',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 'clamp(22px, 2.6vw, 36px)',
                        fontWeight: 400,
                        color: isActive ? COLORS.accent : COLORS.text,
                        transition: 'color 0.22s ease',
                      }}
                      className="group-hover:text-[#D7BC8C]"
                    >
                      {m.name}
                    </span>

                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 13,
                        letterSpacing: '0.12em',
                        color: isActive ? COLORS.accent : COLORS.secondary,
                        transition: 'color 0.22s ease',
                      }}
                      className="group-hover:text-[#D7BC8C]"
                    >
                      {formattedNumber}
                    </span>
                  </button>

                  {/* Mobile Compact Expandable Preview (< 1024px) */}
                  <div className="lg:hidden">
                    <AnimatePresence initial={false}>
                      {isExpandedOnMobile && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            style={{
                              background: COLORS.surface,
                              border: `1px solid ${COLORS.line}`,
                              borderRadius: 14,
                              padding: '24px 20px',
                              marginBottom: 20,
                            }}
                          >
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#292720]">
                              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#C5A46D]">
                                {m.category}
                              </span>
                              <span className="text-[10px] font-mono text-[#77736B]">
                                SYS-0{i + 1}
                              </span>
                            </div>

                            <p
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 14,
                                color: COLORS.secondary,
                                lineHeight: 1.6,
                                marginBottom: 16,
                              }}
                            >
                              {m.detail}
                            </p>

                            {/* Mini UI Blueprint inside Mobile Accordion */}
                            <div className="rounded-lg bg-[#0A0A09] border border-[#292720] p-3 space-y-2 mb-4 font-mono text-xs">
                              <div className="flex items-center justify-between text-[10.5px]">
                                <span className="text-[#A6A197]">{m.mockup.metricLabel}</span>
                                <span className="text-[#C5A46D] font-semibold">{m.mockup.metricValue}</span>
                              </div>
                              <div className="text-[10px] text-[#77736B]">{m.mockup.subtext}</div>
                            </div>

                            {/* Features list */}
                            <div className="space-y-1.5 pt-2 border-t border-[#292720]">
                              {m.features.map((f) => (
                                <div key={f} className="flex items-center gap-2 text-xs text-[#F2EEE6] font-sans">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D]" />
                                  <span>{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (5 cols): Dynamic Floating Preview Panel that naturally follows active row (>= 1024px) */}
          <div className="hidden lg:block lg:col-span-5 relative h-full">
            <motion.div
              animate={{ y: panelTop }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 28,
              }}
              style={{
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'auto',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    background: COLORS.card,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 18,
                    padding: '32px 28px',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
                  }}
                >
                  {/* Top Bar with Category & Tag */}
                  <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#292720]">
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: COLORS.accent,
                      }}
                    >
                      {activeModule.category}
                    </span>
                    <span className="font-mono text-xs text-[#77736B]">
                      SYS-0{active + 1}
                    </span>
                  </div>

                  {/* Service Title */}
                  <h3
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 26,
                      fontWeight: 400,
                      color: COLORS.text,
                      lineHeight: 1.25,
                      marginBottom: 12,
                    }}
                  >
                    {activeModule.name}
                  </h3>

                  {/* Concise Description */}
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 14,
                      color: COLORS.secondary,
                      lineHeight: 1.65,
                      marginBottom: 20,
                    }}
                  >
                    {activeModule.detail}
                  </p>

                  {/* Visual Software Blueprint Card */}
                  <div
                    style={{
                      background: '#0A0A09',
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: 12,
                      padding: '16px',
                      marginBottom: 22,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3 text-[11px] font-mono">
                      <span className="text-[#C5A46D] font-medium tracking-wide">
                        {activeModule.mockup.statusBadge}
                      </span>
                      <span className="text-[#F2EEE6] font-semibold text-xs">
                        {activeModule.mockup.metricValue}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-2.5">
                      {activeModule.mockup.rows.map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between p-1.5 rounded text-[11.5px] font-mono border"
                          style={{
                            background: row.active ? 'rgba(197, 164, 109, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                            borderColor: row.active ? 'rgba(197, 164, 109, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                          }}
                        >
                          <span style={{ color: row.active ? COLORS.accent : COLORS.secondary }}>
                            {row.label}
                          </span>
                          <span style={{ color: COLORS.text }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10.5px] font-mono text-[#77736B] pt-1">
                      {activeModule.mockup.subtext}
                    </div>
                  </div>

                  {/* Architecture Deliverables */}
                  <div className="pt-4 border-t border-[#292720]">
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10.5,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: COLORS.accent,
                        marginBottom: 10,
                      }}
                    >
                      Production Capabilities
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {activeModule.features.map((feat) => (
                        <div
                          key={feat}
                          className="flex items-center gap-2 text-xs font-sans text-[#F2EEE6]/90"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D] shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
