import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  m as motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useAnimation,
} from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

interface SystemModule {
  id: string;
  index: string;
  name: string;
  category: string;
  client?: {
    name: string;
    logo?: string;
    tag: string;
  };
  summary: string;
  outcome: string;
  deliverables: string[];
  impact: string;
}

const MODULES: SystemModule[] = [
  {
    id: 'salon',
    index: '01',
    name: 'Salon Management',
    category: 'Admin Platform',
    client: {
      name: 'WOW Salons',
      logo: '/apps/wow-salon-logo.webp',
      tag: 'Multi-Branch Deployment',
    },
    summary: 'Appointments, staff commissions, and live booking schedules across multiple branches.',
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
    index: '02',
    name: 'Farmhouse Booking',
    category: 'Booking Engine',
    client: {
      name: 'Ten11 Farmhouse Retreat',
      logo: '/apps/ten11-logo.jpg',
      tag: 'Direct Guest Booking',
    },
    summary: 'Public availability calendars, dynamic pricing rules, and instant reservation passes.',
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
    index: '03',
    name: 'Business Dashboards',
    category: 'Executive Analytics',
    client: {
      name: 'Executive Operations',
      tag: 'Real-Time Visibility',
    },
    summary: 'Real-time revenue, bookings, and cash flow built around how owners check numbers.',
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
    index: '04',
    name: 'CRM Systems',
    category: 'Client Pipelines',
    client: {
      name: 'Sales Operations',
      tag: 'Pipeline Velocity',
    },
    summary: 'Visual lead stages, follow-up automations, and direct 1-click WhatsApp customer chats.',
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
    index: '05',
    name: 'Inventory & Billing',
    category: 'Commerce & POS',
    client: {
      name: 'Retail & Warehouse',
      tag: 'Stock Reconciliation',
    },
    summary: 'Point-of-sale checkout, GST invoices, and stock counts that stay true to physical count.',
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
    index: '06',
    name: 'Business Automation',
    category: 'Workflow Daemons',
    client: {
      name: 'Process Engineering',
      tag: 'Zero Middle Steps',
    },
    summary: 'Background daemons, webhook queues, and alerts that eliminate manual data copy-pasting.',
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
    index: '07',
    name: 'Gym Management',
    category: 'Fitness Operations',
    client: {
      name: 'Fitness Clubs',
      tag: 'Access & Memberships',
    },
    summary: 'Member subscriptions, class reservation limits, and turnstile hardware integrations.',
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
    index: '08',
    name: 'Clinic Management',
    category: 'Healthcare Suite',
    client: {
      name: 'Medical Practice',
      tag: 'Confidential Records',
    },
    summary: 'Encrypted patient records, digital prescriptions, and live consultation waiting queues.',
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
    index: '09',
    name: 'Restaurant Systems',
    category: 'Hospitality POS',
    client: {
      name: 'Dining & Kitchen',
      tag: 'Peak Rush Reliability',
    },
    summary: 'Interactive floor maps, kitchen display order routing, and split-payment checkout.',
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
  const [activeModule, setActiveModule] = useState<SystemModule | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const controls = useAnimation();
  const rotation = useMotionValue(0);
  const animFrameRef = useRef<number | null>(null);

  // Responsive breakpoint detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cylinder geometry calculations
  const faceCount = MODULES.length; // 9 cards
  const cardWidth = isMobile ? 290 : 370;
  const cardHeight = isMobile ? 210 : 250;
  // Circumference formula: C = faceWidth * faceCount -> radius = C / (2 * PI)
  const cylinderRadius = useMemo(() => {
    const circumference = cardWidth * faceCount * 1.08;
    return Math.round(circumference / (2 * Math.PI));
  }, [cardWidth, faceCount]);

  const transform = useTransform(rotation, (val) => `rotate3d(0, 1, 0, ${val}deg)`);

  // Slow ambient drift when not dragging, paused when hovered or modal is open
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // Only auto-drift if user is not hovering, not dragging, and modal is closed
      if (!isDragging && !isHovered && !activeModule) {
        // Slow ambient rotation: ~3.5 degrees per second
        const step = (delta / 1000) * 3.5;
        rotation.set(rotation.get() - step);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDragging, isHovered, activeModule, rotation]);

  const handleNext = () => {
    controls.stop();
    const current = rotation.get();
    const target = current - 360 / faceCount;
    controls.start({
      rotateY: target,
      transition: { type: 'spring', stiffness: 120, damping: 20 },
    });
    rotation.set(target);
  };

  const handlePrev = () => {
    controls.stop();
    const current = rotation.get();
    const target = current + 360 / faceCount;
    controls.start({
      rotateY: target,
      transition: { type: 'spring', stiffness: 120, damping: 20 },
    });
    rotation.set(target);
  };

  const handleCardClick = (m: SystemModule) => {
    // Only open details if user wasn't actively dragging
    if (!isDragging) {
      setActiveModule(m);
      controls.stop();
    }
  };

  const closeModal = useCallback(() => {
    setActiveModule(null);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  return (
    <section
      id="work"
      style={{
        background: COLORS.bg,
        padding: '130px 0 110px',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <div className="max-w-[1240px] mx-auto px-6 mb-8 text-center">
        <Reveal>
          <div className="flex flex-col items-center">
            <Eyebrow>What we build</Eyebrow>
            <h2
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 400,
                fontSize: 'clamp(32px, 4.2vw, 56px)',
                color: COLORS.text,
                lineHeight: 1.15,
                marginTop: 16,
                maxWidth: 720,
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
                maxWidth: 620,
                lineHeight: 1.6,
              }}
            >
              Rotate through our core engineering capabilities. Drag horizontally to explore or select any card for architecture details.
            </p>
          </div>
        </Reveal>
      </div>

      {/* 3D Cylindrical Carousel Viewport */}
      <div
        className="relative w-full overflow-hidden flex items-center justify-center"
        style={{
          height: isMobile ? 420 : 520,
          perspective: '1200px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle Edge Vignettes to enhance cylindrical depth */}
        <div
          className="absolute left-0 top-0 bottom-0 w-20 md:w-36 z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, #0A0A09 0%, rgba(10,10,9,0) 100%)',
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-20 md:w-36 z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, #0A0A09 0%, rgba(10,10,9,0) 100%)',
          }}
        />

        {/* 3D Rotating Cylinder Core */}
        <motion.div
          drag="x"
          dragElastic={0.08}
          onDragStart={() => setIsDragging(true)}
          onDrag={(_, info) => {
            const dragFactor = isMobile ? 0.08 : 0.05;
            rotation.set(rotation.get() + info.delta.x * dragFactor);
          }}
          onDragEnd={(_, info) => {
            setTimeout(() => setIsDragging(false), 50);
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.03,
              transition: {
                type: 'spring',
                stiffness: 90,
                damping: 24,
                mass: 0.2,
              },
            });
          }}
          className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{
            transform,
            rotateY: rotation,
            width: cardWidth,
            height: cardHeight,
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
          animate={controls}
        >
          {MODULES.map((m, i) => {
            const angle = i * (360 / faceCount);

            return (
              <div
                key={m.id}
                role="button"
                tabIndex={0}
                aria-label={`Open details for ${m.name}`}
                onClick={() => handleCardClick(m)}
                className="group absolute top-0 left-0 rounded-2xl p-6 md:p-7 flex flex-col justify-between transition-all duration-300"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.line}`,
                  boxShadow: '0 20px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)',
                  transform: `rotateY(${angle}deg) translateZ(${cylinderRadius}px)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'visible',
                }}
              >
                {/* Card Top Meta */}
                <div className="flex items-center justify-between pb-3 border-b border-[#292720]">
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12,
                        letterSpacing: '0.12em',
                        color: COLORS.accent,
                        fontWeight: 600,
                      }}
                    >
                      {m.index}
                    </span>
                    <span className="text-[#292720]">/</span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: COLORS.secondary,
                      }}
                    >
                      {m.category}
                    </span>
                  </div>

                  {m.client && (
                    <span className="text-[9.5px] font-mono text-[#A6A197] px-2 py-0.5 rounded bg-[#0A0A09] border border-[#292720]">
                      {m.client.tag}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="my-auto py-2">
                  <h3
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: isMobile ? 21 : 25,
                      fontWeight: 400,
                      color: COLORS.text,
                      lineHeight: 1.22,
                      marginBottom: 8,
                    }}
                    className="group-hover:text-[#D7BC8C] transition-colors"
                  >
                    {m.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12.5,
                      color: COLORS.secondary,
                      lineHeight: 1.5,
                    }}
                    className="line-clamp-2"
                  >
                    {m.summary}
                  </p>
                </div>

                {/* Card Bottom: Client Logo or Inspect Action */}
                <div className="pt-3 border-t border-[#292720] flex items-center justify-between text-xs">
                  {m.client?.logo ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={m.client.logo}
                        alt={m.client.name}
                        className="w-5 h-5 rounded object-cover border border-[#292720]"
                      />
                      <span className="text-[11px] font-mono text-[#A6A197]">{m.client.name}</span>
                    </div>
                  ) : (
                    <span className="text-[10.5px] font-mono text-[#77736B]">DuoKarma System</span>
                  )}

                  <span className="text-[11px] font-mono text-[#C5A46D] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Inspect</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Manual Controls & Indicator */}
      <div className="max-w-[1240px] mx-auto px-6 mt-4 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Rotate Previous System"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#151512] border border-[#292720] text-[#F2EEE6] hover:border-[#C5A46D] hover:text-[#C5A46D] transition-colors cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span className="font-mono text-xs text-[#77736B] tracking-wider uppercase">
          Drag cylinder or use arrows
        </span>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Rotate Next System"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#151512] border border-[#292720] text-[#F2EEE6] hover:border-[#C5A46D] hover:text-[#C5A46D] transition-colors cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Click-to-Inspect Modal Overlay */}
      <AnimatePresence>
        {activeModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[620px] rounded-2xl bg-[#11110F] border border-[#292720] p-7 md:p-9 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center bg-[#151512] border border-[#292720] text-[#A6A197] hover:text-[#F2EEE6] hover:border-[#C5A46D] transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Modal Category Tag */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#292720]">
                <span className="font-mono text-xs uppercase tracking-wider text-[#C5A46D] font-semibold">
                  SYS-{activeModule.index} // {activeModule.category}
                </span>
                {activeModule.client && (
                  <span className="text-[10px] font-mono text-[#A6A197] px-2 py-0.5 rounded bg-[#0A0A09] border border-[#292720]">
                    {activeModule.client.tag}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 'clamp(26px, 3vw, 34px)',
                  fontWeight: 400,
                  color: COLORS.text,
                  lineHeight: 1.2,
                  marginBottom: 16,
                }}
              >
                {activeModule.name}
              </h3>

              {/* Verified Client Badge if repo asset exists */}
              {activeModule.client?.logo && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0A09] border border-[#292720] mb-5">
                  <img
                    src={activeModule.client.logo}
                    alt={activeModule.client.name}
                    className="w-10 h-10 rounded object-cover border border-[#292720]"
                  />
                  <div>
                    <div className="text-xs text-[#F2EEE6] font-medium">{activeModule.client.name}</div>
                    <div className="text-[10.5px] font-mono text-[#A6A197]">
                      Verified Production Deployment
                    </div>
                  </div>
                </div>
              )}

              {/* Outcome narrative */}
              <p className="text-sm font-sans text-[#A6A197] leading-relaxed mb-6">
                {activeModule.outcome}
              </p>

              {/* Architecture Deliverables */}
              <div className="pt-4 border-t border-[#292720] mb-6">
                <div className="font-mono text-[10.5px] uppercase tracking-wider text-[#C5A46D] mb-3">
                  Production Architecture
                </div>
                <ul className="space-y-2">
                  {activeModule.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-xs text-[#F2EEE6] font-sans">
                      <span className="text-[#C5A46D] text-[10px] mt-0.5">✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Production Result */}
              <div
                style={{
                  background: 'rgba(197, 164, 109, 0.05)',
                  border: '1px solid rgba(197, 164, 109, 0.25)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 24,
                }}
              >
                <div className="text-[10px] font-mono text-[#C5A46D] uppercase tracking-wider mb-1">
                  Verified Result
                </div>
                <div className="text-xs font-mono text-[#F2EEE6] leading-relaxed">
                  {activeModule.impact}
                </div>
              </div>

              {/* Call to action */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href="#contact"
                  onClick={closeModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider text-[#0A0A09] bg-[#C5A46D] hover:bg-[#D7BC8C] font-semibold transition-colors"
                >
                  <span>Inquire about this architecture</span>
                  <span>→</span>
                </a>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-xs font-mono text-[#77736B] hover:text-[#A6A197] transition-colors"
                >
                  Close [Esc]
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
