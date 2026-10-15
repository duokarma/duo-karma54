import { useState, useRef, useEffect, useCallback } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

interface SystemModule {
  id: string;
  name: string;
  category: string;
  client?: {
    name: string;
    logo?: string;
    tag: string;
  };
  outcome: string;
  deliverables: string[];
  impact: string;
}

const MODULES: SystemModule[] = [
  {
    id: 'salon',
    name: 'Salon Management',
    category: 'Admin Platform',
    client: {
      name: 'WOW Salons',
      logo: '/apps/wow-salon-logo.webp',
      tag: 'Multi-Branch Deployment',
    },
    outcome:
      'Replaced three separate paper registers and WhatsApp booking threads with a single live management console across all branch locations.',
    deliverables: [
      'Live multi-stylist appointment calendar',
      'Automated commission engine & GST invoicing',
      'Client digital formula ledger & visit history',
      'Instant WhatsApp confirmation & reminder triggers',
    ],
    impact: '100% paperless daily scheduling across 3 branches with zero booking overlaps.',
  },
  {
    id: 'farmhouse',
    name: 'Farmhouse Booking',
    category: 'Booking Engine',
    client: {
      name: 'Ten11 Farmhouse Retreat',
      logo: '/apps/ten11-logo.jpg',
      tag: 'Direct Guest Booking',
    },
    outcome:
      'Direct guest reservation pipeline eliminating third-party commission fees, double-booking risks, and manual coordination phone-tag.',
    deliverables: [
      'Real-time date availability matrix & blackout locks',
      'Dynamic seasonal & weekend pricing calculation',
      'Integrated payment gateway with automated digital receipts',
      'Automated gate pass & arrival details dispatch',
    ],
    impact: 'Zero double-bookings across 24 consecutive months of production operations.',
  },
  {
    id: 'dashboards',
    name: 'Business Dashboards',
    category: 'Executive Intelligence',
    client: {
      name: 'Owner Operations',
      tag: 'Real-Time Visibility',
    },
    outcome:
      'Consolidated daily revenue, customer bookings, and branch performance into one clear screen, built around how owners actually check numbers.',
    deliverables: [
      'Real-time gross bookings & net revenue reconciliation',
      'Direct banking transaction & accounting feed sync',
      'Cross-branch comparative performance matrices',
      'Automated morning operational brief via email & messaging',
    ],
    impact: 'Instant operational clarity every morning without manual spreadsheet assembly.',
  },
  {
    id: 'crm',
    name: 'CRM Systems',
    category: 'Client Pipelines',
    client: {
      name: 'Client Operations',
      tag: 'Pipeline Velocity',
    },
    outcome:
      'Tracks inquiries, client conversations, and pipeline stages with 1-click WhatsApp messaging instead of disconnected spreadsheets.',
    deliverables: [
      'Visual deal stage pipeline customized to business sales flows',
      'Direct 1-click WhatsApp customer messaging templates',
      'Stale-deal escalation alerts & automatic follow-up reminders',
      'Centralized client communication history & proposal ledger',
    ],
    impact: 'Shorter conversion cycles and zero qualified inquiries falling through the cracks.',
  },
  {
    id: 'inventory',
    name: 'Inventory & Billing',
    category: 'Commerce & POS',
    client: {
      name: 'Warehouse & Retail',
      tag: 'Stock Reconciliation',
    },
    outcome:
      'Real-time stock tracking, point-of-sale checkout, and GST billing that stays perfectly synchronized with actual shelf count.',
    deliverables: [
      'Instant inventory depletion upon point-of-sale settlement',
      'GST-compliant electronic tax invoice generation',
      'Automated low-inventory alerts and reorder buffers',
      'Multi-location stock transfers and supplier purchase ledgers',
    ],
    impact: 'Eliminates discrepancy between counter sales and physical warehouse count.',
  },
  {
    id: 'automation',
    name: 'Business Automation',
    category: 'Workflow Daemons',
    client: {
      name: 'Process Engineering',
      tag: 'Zero Middle Steps',
    },
    outcome:
      'Background daemons, webhook queues, and automated alerts that remove repetitive manual copy-pasting across your tech stack.',
    deliverables: [
      'Background cron workers and fault-tolerant job queues',
      'Bi-directional webhook sync between payment gateways and CRM',
      'Automated customer transaction receipts & delivery updates',
      'Self-healing error retry pipelines with admin notifications',
    ],
    impact: 'Frees teams from 15+ hours of repetitive manual data re-entry every week.',
  },
  {
    id: 'gym',
    name: 'Gym Management',
    category: 'Fitness Operations',
    client: {
      name: 'Fitness Clubs',
      tag: 'Access & Memberships',
    },
    outcome:
      'Member subscriptions, class scheduling, turnstile hardware access, and automated recurring billing for high-volume fitness clubs.',
    deliverables: [
      'RFID & biometric turnstile entry integration',
      'Trainer schedule & personal training commission tracking',
      'Recurring automated subscription debit & renewal reminders',
      'Real-time class capacity limits & waiting list engine',
    ],
    impact: 'Friction-free check-ins and predictable recurring membership cash flow.',
  },
  {
    id: 'clinic',
    name: 'Clinic Management',
    category: 'Healthcare Suite',
    client: {
      name: 'Medical Practice',
      tag: 'Confidential Records',
    },
    outcome:
      'Patient records, appointment scheduling, digital prescriptions, and queue management engineered with strict data confidentiality.',
    deliverables: [
      'Encrypted patient records vault with strict role access',
      'Live consultation queue and token display system',
      'Digital prescription generator with instant print & PDF export',
      'Diagnostic lab result webhook and billing integration',
    ],
    impact: 'Shorter waiting room times and paperless consultation records.',
  },
  {
    id: 'restaurant',
    name: 'Restaurant Systems',
    category: 'Hospitality POS',
    client: {
      name: 'Dining & Kitchen',
      tag: 'Peak Rush Reliability',
    },
    outcome:
      'Floor map table management, kitchen order ticketing (KOT) routing, and split-payment checkout built to withstand dinner rushes.',
    deliverables: [
      'Interactive visual table floor map with occupancy status',
      'Direct kitchen order ticketing (KOT) routing to prep stations',
      'Split-bill, card, and UPI payment checkout engine',
      'Real-time ingredient recipe inventory deduction',
    ],
    impact: 'Faster table turnover and error-free communication between floor and kitchen.',
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
      const relativeTop = rowRect.top - containerRect.top;
      // Clamp so panel never overflows bottom of container
      const maxTop = Math.max(0, containerRect.height - 480);
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
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                color: COLORS.secondary,
                marginTop: 14,
                maxWidth: 600,
                lineHeight: 1.6,
              }}
            >
              From multi-branch operations to custom booking engines, we engineer software around how your business actually runs.
            </p>
          </div>
        </Reveal>

        {/* Two-Column Interactive Layout Container */}
        <div
          ref={listContainerRef}
          className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start"
          style={{ minHeight: 720 }}
        >
          {/* Left Column (7 cols): Spacious Vertical Editorial List */}
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
                              borderRadius: 12,
                              padding: '24px 20px',
                              marginBottom: 20,
                            }}
                          >
                            {/* Category & Badge */}
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#292720]">
                              <span className="font-mono text-[11px] uppercase tracking-wider text-[#C5A46D]">
                                {m.category}
                              </span>
                              {m.client && (
                                <span className="text-[10px] font-mono text-[#A6A197] px-2 py-0.5 rounded bg-[#151512] border border-[#292720]">
                                  {m.client.tag}
                                </span>
                              )}
                            </div>

                            {/* Client Logo if real asset exists in DuoKarma */}
                            {m.client?.logo && (
                              <div className="flex items-center gap-3 mb-3 p-2.5 rounded bg-[#0A0A09] border border-[#292720]">
                                <img
                                  src={m.client.logo}
                                  alt={m.client.name}
                                  className="w-8 h-8 rounded object-cover border border-[#292720]"
                                />
                                <div>
                                  <div className="text-xs text-[#F2EEE6] font-medium">{m.client.name}</div>
                                  <div className="text-[10px] text-[#A6A197]">Verified Production Client</div>
                                </div>
                              </div>
                            )}

                            {/* Outcome text */}
                            <p
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 13.5,
                                color: COLORS.secondary,
                                lineHeight: 1.6,
                                marginBottom: 16,
                              }}
                            >
                              {m.outcome}
                            </p>

                            {/* Deliverables */}
                            <div className="space-y-1.5 pt-2 border-t border-[#292720]">
                              {m.deliverables.map((f) => (
                                <div key={f} className="flex items-start gap-2 text-xs text-[#F2EEE6] font-sans">
                                  <span className="text-[#C5A46D] mt-0.5">✦</span>
                                  <span>{f}</span>
                                </div>
                              ))}
                            </div>

                            {/* Impact callout */}
                            <div className="mt-3.5 pt-2.5 border-t border-[#292720] text-[11.5px] font-mono text-[#C5A46D]">
                              {m.impact}
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

          {/* Right Column (5 cols): Editorial Floating Detail Panel aligned with active row (>= 1024px) */}
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    background: COLORS.surface,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 14,
                    padding: '36px 32px',
                    boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
                  }}
                >
                  {/* Category & Identifier */}
                  <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#292720]">
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: COLORS.accent,
                      }}
                    >
                      {String(active + 1).padStart(2, '0')} // {activeModule.category}
                    </span>
                    {activeModule.client && (
                      <span className="text-[10.5px] font-mono text-[#A6A197] px-2.5 py-0.5 rounded bg-[#0A0A09] border border-[#292720]">
                        {activeModule.client.tag}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 28,
                      fontWeight: 400,
                      color: COLORS.text,
                      lineHeight: 1.2,
                      marginBottom: 16,
                    }}
                  >
                    {activeModule.name}
                  </h3>

                  {/* Real Client Badge when asset exists in DuoKarma */}
                  {activeModule.client?.logo && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        background: '#0A0A09',
                        border: `1px solid ${COLORS.line}`,
                        borderRadius: 10,
                        marginBottom: 18,
                      }}
                    >
                      <img
                        src={activeModule.client.logo}
                        alt={activeModule.client.name}
                        className="w-10 h-10 rounded object-cover border border-[#292720]"
                      />
                      <div>
                        <div className="text-xs text-[#F2EEE6] font-medium">
                          {activeModule.client.name}
                        </div>
                        <div className="text-[10.5px] font-mono text-[#A6A197]">
                          Verified DuoKarma Production Deployment
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Business Outcome Narrative */}
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 14.5,
                      color: COLORS.secondary,
                      lineHeight: 1.65,
                      marginBottom: 24,
                    }}
                  >
                    {activeModule.outcome}
                  </p>

                  {/* Engineering Deliverables */}
                  <div className="pt-4 border-t border-[#292720] mb-5">
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10.5,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: COLORS.accent,
                        marginBottom: 14,
                      }}
                    >
                      System Architecture
                    </div>
                    <ul className="space-y-2">
                      {activeModule.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-xs text-[#F2EEE6]/90 font-sans leading-relaxed"
                        >
                          <span className="text-[#C5A46D] text-[10px] mt-0.5">✦</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quantifiable Production Impact */}
                  <div
                    style={{
                      background: 'rgba(197, 164, 109, 0.04)',
                      border: '1px solid rgba(197, 164, 109, 0.2)',
                      borderRadius: 8,
                      padding: '12px 14px',
                      marginBottom: 20,
                    }}
                  >
                    <div className="text-[10.5px] font-mono text-[#C5A46D] uppercase tracking-wider mb-1">
                      Production Result
                    </div>
                    <div className="text-xs font-mono text-[#F2EEE6] leading-relaxed">
                      {activeModule.impact}
                    </div>
                  </div>

                  {/* Inquire Action Link */}
                  <div className="pt-2">
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C5A46D] hover:text-[#D7BC8C] transition-colors"
                    >
                      <span>Inquire about this architecture</span>
                      <span>→</span>
                    </a>
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
