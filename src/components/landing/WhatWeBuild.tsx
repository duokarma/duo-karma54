import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  m as motion,
  AnimatePresence,
  useMotionValue,
  animate,
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
    summary: 'Appointments, staff schedules, and billing synchronized across branches.',
    outcome:
      'Replaced three separate paper registers and WhatsApp booking threads with a single live management console across all branch locations.',
    deliverables: [
      'Live multi-stylist appointment calendar',
      'Automated commission calculation & GST invoicing',
      'Client digital formula ledger & visit history',
      'Instant WhatsApp confirmation & reminder triggers',
    ],
    impact: 'Paperless daily scheduling across 3 branches with zero booking overlaps.',
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
    summary: 'Direct availability calendars, dynamic pricing, and automated passes.',
    outcome:
      'Direct guest reservation pipeline eliminating third-party commission fees, double-booking risks, and manual coordination phone-tag.',
    deliverables: [
      'Real-time date availability matrix & blackout locks',
      'Dynamic seasonal & weekend pricing calculation',
      'Integrated payment gateway with automated digital receipts',
      'Automated gate pass & arrival details dispatch',
    ],
    impact: 'Automated direct booking pipeline with zero calendar conflicts.',
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
    summary: 'Consolidated revenue, bookings, and cash flow built for company leadership.',
    outcome:
      'Consolidated daily revenue, customer bookings, and branch performance into one clear screen, built around how owners actually check numbers.',
    deliverables: [
      'Gross bookings & net revenue reconciliation',
      'Direct banking transaction & accounting feed sync',
      'Cross-branch comparative performance matrices',
      'Automated morning operational brief via messaging',
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
    summary: 'Visual sales pipelines, follow-ups, and direct 1-click WhatsApp customer chats.',
    outcome:
      'Tracks inquiries, client conversations, and pipeline stages with 1-click WhatsApp messaging instead of disconnected spreadsheets.',
    deliverables: [
      'Visual deal stage pipeline customized to business sales flows',
      'Direct 1-click WhatsApp customer messaging templates',
      'Stale-deal escalation alerts & automatic follow-up reminders',
      'Centralized client communication history & proposal ledger',
    ],
    impact: 'Accelerated conversion cycles and zero qualified inquiries lost.',
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
    summary: 'Point-of-sale checkout, GST invoices, and live warehouse inventory counts.',
    outcome:
      'Real-time stock tracking, point-of-sale checkout, and GST billing that stays perfectly synchronized with actual shelf count.',
    deliverables: [
      'Instant inventory depletion upon point-of-sale settlement',
      'GST-compliant electronic tax invoice generation',
      'Automated low-inventory alerts and reorder buffers',
      'Multi-location stock transfers and supplier purchase ledgers',
    ],
    impact: 'Eliminated discrepancies between counter checkout and warehouse count.',
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
    impact: 'Eliminates repetitive manual copy-paste workflows across operations.',
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
    summary: 'Member subscriptions, class reservation limits, and turnstile hardware integration.',
    outcome:
      'Member subscriptions, class scheduling, turnstile hardware access, and automated recurring billing for high-volume fitness clubs.',
    deliverables: [
      'RFID & biometric turnstile entry integration',
      'Trainer schedule & personal training commission tracking',
      'Recurring automated subscription debit & renewal reminders',
      'Real-time class capacity limits & waiting list engine',
    ],
    impact: 'Friction-free turnstile check-ins and automated subscription renewals.',
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
    impact: 'Shortened waiting room times and secure digital consultation records.',
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
    impact: 'Faster table turnover and synchronized floor-to-kitchen communications.',
  },
];

export function WhatWeBuild() {
  const [activeModule, setActiveModule] = useState<SystemModule | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [screenWidth, setScreenWidth] = useState(1200);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const rotation = useMotionValue(0);
  const isAnimatingRef = useRef(false);
  const activeAnimationRef = useRef<{ stop: () => void } | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollYRef = useRef<number>(typeof window !== 'undefined' ? window.scrollY : 0);

  // Responsive breakpoint and reduced-motion detection
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  const faceCount = MODULES.length; // 9 cards
  const stepAngle = 360 / faceCount; // 40 degrees
  const cardWidth = isMobile ? 260 : isTablet ? 320 : 360;
  const cardHeight = isMobile ? 185 : isTablet ? 215 : 230;

  // Regular polygon apothem radius formula: R = (w / 2) / sin(pi / n) + clearance
  const cylinderRadius = useMemo(() => {
    const halfAngleRad = Math.PI / faceCount;
    const baseRadius = (cardWidth / 2) / Math.sin(halfAngleRad);
    const clearance = isMobile ? 40 : isTablet ? 80 : 110;
    return Math.round(baseRadius + clearance);
  }, [cardWidth, faceCount, isMobile, isTablet]);

  const rotateTo = useCallback((targetAngle: number) => {
    if (activeAnimationRef.current) {
      activeAnimationRef.current.stop();
    }
    isAnimatingRef.current = true;
    activeAnimationRef.current = animate(rotation, targetAngle, {
      type: 'spring',
      stiffness: 100,
      damping: 22,
      mass: 0.5,
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });
  }, [rotation]);

  const handleNext = useCallback(() => {
    const current = rotation.get();
    const currentSnapped = Math.round(current / stepAngle) * stepAngle;
    rotateTo(currentSnapped - stepAngle);
  }, [rotation, stepAngle, rotateTo]);

  const handlePrev = useCallback(() => {
    const current = rotation.get();
    const currentSnapped = Math.round(current / stepAngle) * stepAngle;
    rotateTo(currentSnapped + stepAngle);
  }, [rotation, stepAngle, rotateTo]);

  // Direct mouse wheel / trackpad scroll over the 3D cylinder
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (activeModule || isDragging) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 1) return;

    setIsHovered(true);
    if (activeAnimationRef.current) activeAnimationRef.current.stop();

    const wheelSensitivity = isMobile ? 0.32 : 0.22;
    rotation.set(rotation.get() - delta * wheelSensitivity);

    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(() => {
      if (!isDragging && !activeModule) {
        const current = rotation.get();
        const target = Math.round(current / stepAngle) * stepAngle;
        rotateTo(target);
      }
    }, 180);
  }, [activeModule, isDragging, isMobile, rotation, stepAngle, rotateTo]);

  // Window scroll-driven rotation: as user scrolls down/up the page, the cylinder rotates
  useEffect(() => {
    if (prefersReducedMotion) return;

    let ticking = false;

    const handleWindowScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;

      if (inView && !isDragging && !activeModule) {
        if (!ticking) {
          requestAnimationFrame(() => {
            if (activeAnimationRef.current) activeAnimationRef.current.stop();
            const scrollFactor = isMobile ? 0.18 : 0.12;
            rotation.set(rotation.get() - delta * scrollFactor);
            ticking = false;
          });
          ticking = true;
        }

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          if (!isDragging && !activeModule) {
            const current = rotation.get();
            const target = Math.round(current / stepAngle) * stepAngle;
            rotateTo(target);
          }
        }, 220);
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    };
  }, [prefersReducedMotion, isDragging, activeModule, isMobile, rotation, stepAngle, rotateTo]);

  // Automatic idle rotation: advances to next card every 4.2s, pausing on hover, drag, modal, or reduced motion
  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      if (!isDragging && !isHovered && !activeModule && !isAnimatingRef.current) {
        handleNext();
      }
    }, 4200);

    return () => clearInterval(timer);
  }, [isDragging, isHovered, activeModule, prefersReducedMotion, handleNext]);

  const handleCardClick = (m: SystemModule) => {
    if (!isDragging) {
      if (activeAnimationRef.current) activeAnimationRef.current.stop();
      setActiveModule(m);
    }
  };

  const closeModal = useCallback(() => {
    setActiveModule(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (!activeModule) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrev();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal, activeModule, handleNext, handlePrev]);

  return (
    <section
      ref={sectionRef}
      id="work"
      style={{
        background: COLORS.bg,
        padding: isMobile ? '90px 0 70px' : '130px 0 100px',
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
                fontSize: 'clamp(28px, 4vw, 52px)',
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
                fontSize: 14.5,
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
          height: isMobile ? 360 : isTablet ? 420 : 470,
          perspective: isMobile ? '1000px' : '1300px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => {
          setTimeout(() => setIsHovered(false), 2500);
        }}
        onWheel={handleWheel}
      >
        {/* Edge Vignettes to blend side cards into background */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 md:w-36 z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, #0A0A09 0%, rgba(10,10,9,0) 100%)',
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 md:w-36 z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, #0A0A09 0%, rgba(10,10,9,0) 100%)',
          }}
        />

        {/* 3D Rotating Cylinder */}
        <motion.div
          drag="x"
          dragElastic={0.06}
          onDragStart={() => {
            if (activeAnimationRef.current) activeAnimationRef.current.stop();
            setIsDragging(true);
          }}
          onDrag={(_, info) => {
            const dragFactor = isMobile ? 0.08 : 0.045;
            rotation.set(rotation.get() + info.delta.x * dragFactor);
          }}
          onDragEnd={(_, info) => {
            setTimeout(() => setIsDragging(false), 50);
            const current = rotation.get();
            const velocityFactor = isMobile ? 0.045 : 0.035;
            const projected = current + info.velocity.x * velocityFactor;
            const target = Math.round(projected / stepAngle) * stepAngle;
            rotateTo(target);
          }}
          className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{
            z: -cylinderRadius,
            rotateY: rotation,
            width: cardWidth,
            height: cardHeight,
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
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
                className="group absolute top-0 left-0 rounded-2xl p-5 md:p-6 flex flex-col justify-between transition-colors duration-200"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  background: '#11110F',
                  border: `1px solid ${COLORS.line}`,
                  boxShadow: '0 20px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
                  transform: `rotateY(${angle}deg) translateZ(${cylinderRadius}px)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {/* Card Top Row: Sequence + Category */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#292720]">
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11.5,
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
                        fontSize: 9.5,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: COLORS.secondary,
                      }}
                    >
                      {m.category}
                    </span>
                  </div>

                  {m.client && (
                    <span className="text-[9px] font-mono text-[#A6A197] px-2 py-0.5 rounded bg-[#0A0A09] border border-[#292720]">
                      {m.client.tag}
                    </span>
                  )}
                </div>

                {/* Card Title & Benefit Summary */}
                <div className="my-auto py-1">
                  <h3
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: isMobile ? 18 : 22,
                      fontWeight: 400,
                      color: COLORS.text,
                      lineHeight: 1.2,
                      marginBottom: 6,
                    }}
                    className="group-hover:text-[#D7BC8C] transition-colors"
                  >
                    {m.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: isMobile ? 11.5 : 12.5,
                      color: COLORS.secondary,
                      lineHeight: 1.45,
                    }}
                    className="line-clamp-2"
                  >
                    {m.summary}
                  </p>
                </div>

                {/* Card Footer: Verified Client Tag or DuoKarma System */}
                <div className="pt-2.5 border-t border-[#292720] flex items-center justify-between text-xs">
                  {m.client?.logo ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={m.client.logo}
                        alt={m.client.name}
                        className="w-4 h-4 rounded object-cover border border-[#292720]"
                      />
                      <span className="text-[10.5px] font-mono text-[#A6A197]">{m.client.name}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-[#77736B]">DuoKarma Platform</span>
                  )}

                  <span className="text-[10.5px] font-mono text-[#C5A46D] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Inspect</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Carousel Controls */}
      <div className="max-w-[1240px] mx-auto px-6 mt-4 flex items-center justify-center gap-3">
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

      {/* Click-to-Inspect Modal Portaled directly to body */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {activeModule && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeModal}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 14 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full max-w-[580px] rounded-2xl bg-[#11110F] border border-[#292720] p-7 md:p-8 shadow-2xl z-10 max-h-[88vh] overflow-y-auto"
                >
                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close modal"
                    className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center bg-[#151512] border border-[#292720] text-[#A6A197] hover:text-[#F2EEE6] hover:border-[#C5A46D] transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>

                  {/* Header Meta */}
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#292720]">
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
                      fontSize: 'clamp(24px, 3vw, 32px)',
                      fontWeight: 400,
                      color: COLORS.text,
                      lineHeight: 1.2,
                      marginBottom: 14,
                    }}
                  >
                    {activeModule.name}
                  </h3>

                  {/* Verified Client Badge */}
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
                          Verified Production Client
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Outcome narrative */}
                  <p className="text-sm font-sans text-[#A6A197] leading-relaxed mb-5">
                    {activeModule.outcome}
                  </p>

                  {/* Deliverables */}
                  <div className="pt-4 border-t border-[#292720] mb-5">
                    <div className="font-mono text-[10.5px] uppercase tracking-wider text-[#C5A46D] mb-3">
                      Production Architecture
                    </div>
                    <ul className="space-y-2">
                      {activeModule.deliverables.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-[#F2EEE6] font-sans">
                          <span className="text-[#C5A46D] text-[10px] mt-0.5">✦</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Outcome Result */}
                  <div
                    style={{
                      background: 'rgba(197, 164, 109, 0.05)',
                      border: '1px solid rgba(197, 164, 109, 0.25)',
                      borderRadius: 8,
                      padding: '12px 14px',
                      marginBottom: 22,
                    }}
                  >
                    <div className="text-[10px] font-mono text-[#C5A46D] uppercase tracking-wider mb-1">
                      Production Result
                    </div>
                    <div className="text-xs font-mono text-[#F2EEE6] leading-relaxed">
                      {activeModule.impact}
                    </div>
                  </div>

                  {/* CTA & Close */}
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
                      className="text-xs font-mono text-[#77736B] hover:text-[#A6A197] transition-colors cursor-pointer"
                    >
                      Close [Esc]
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
