import { useState } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

const SERVICES: ServiceItem[] = [
  {
    id: 'internal-tools',
    name: 'Internal Tools',
    description: 'We build the exact software your team needs to work faster, instead of forcing you to use clunky off-the-shelf apps.',
    capabilities: [
      'Tailored internal portals & consoles',
      'Team permission & role hierarchy',
      'Custom workflow automation',
      'Data import/export pipelines',
    ],
  },
  {
    id: 'admin-dashboards',
    name: 'Admin Dashboards',
    description: 'A single control panel where you can see exactly what\'s happening in your business and manage everything in one place.',
    capabilities: [
      'Real-time operations tracking',
      'Live revenue & booking telemetry',
      'Custom metrics and audit logs',
      'Multi-location centralized views',
    ],
  },
  {
    id: 'custom-booking',
    name: 'Custom Booking',
    description: 'Systems that let your customers schedule and pay for your services online, completely hands-free.',
    capabilities: [
      'Interactive availability calendar',
      'Integrated payment gateways',
      'Automated SMS & email reminders',
      'Dynamic pricing & buffer rules',
    ],
  },
  {
    id: 'automating-busywork',
    name: 'Automating Busywork',
    description: 'If you\'re copying and pasting data all day, we write scripts to do it for you automatically in the background.',
    capabilities: [
      'Scheduled background cron tasks',
      'Webhook & third-party integrations',
      'Spreadsheet-to-database pipelines',
      'Automated notification triggers',
    ],
  },
  {
    id: 'marketing-sites',
    name: 'Marketing Sites',
    description: 'Fast, custom-built websites that look professional, load instantly, and actually convince people to contact you.',
    capabilities: [
      'Bespoke editorial typography',
      'Sub-second global CDN performance',
      'High-conversion inquiry flows',
      'SEO & metadata infrastructure',
    ],
  },
  {
    id: 'cloud-infrastructure',
    name: 'Cloud Infrastructure',
    description: 'We put your software on reliable servers so it stays online, and we handle all the maintenance.',
    capabilities: [
      'Zero-downtime CI/CD deployment',
      'Automated daily database backups',
      'Global edge caching & SSL',
      'Continuous uptime telemetry',
    ],
  },
  {
    id: 'database-security',
    name: 'Database & Security',
    description: 'We set up secure, modern databases to store your business data safely, complete with proper user logins and backups.',
    capabilities: [
      'PostgreSQL schema engineering',
      'Row-Level Security (RLS) enforcement',
      'Encrypted credentials & auth',
      'Secure API endpoints',
    ],
  },
  {
    id: 'mobile-ready',
    name: 'Mobile Ready',
    description: 'Everything we build works perfectly on your phone, so you can run your business while you\'re away from your desk.',
    capabilities: [
      'Touch-first responsive layouts',
      'Installable PWA functionality',
      'Optimized handheld dashboards',
      'Real-time mobile synchronization',
    ],
  },
];

export function Services() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (index + 1) % SERVICES.length;
      setActiveIndex(next);
      document.getElementById(`service-item-${next}`)?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (index - 1 + SERVICES.length) % SERVICES.length;
      setActiveIndex(prev);
      document.getElementById(`service-item-${prev}`)?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  const activeService = SERVICES[activeIndex] || SERVICES[0];

  return (
    <section
      id="services"
      style={{
        background: COLORS.bg,
        padding: '140px 5%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Section Heading */}
        <Reveal>
          <div style={{ marginBottom: 64 }}>
            <Eyebrow>Services We Provide</Eyebrow>
            <h2
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 400,
                fontSize: 'clamp(28px, 3.6vw, 48px)',
                color: COLORS.text,
                lineHeight: 1.15,
                marginTop: 16,
                maxWidth: 620,
              }}
            >
              What you can hand us.
            </h2>
          </div>
        </Reveal>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start relative">
          
          {/* Left Column — Services list */}
          <div
            className="lg:col-span-7 flex flex-col"
            style={{ borderTop: `1px solid ${COLORS.line}` }}
            role="tablist"
            aria-label="DuoKarma Services"
          >
            {SERVICES.map((service, index) => {
              const isActive = activeIndex === index;
              const formattedNumber = String(index + 1).padStart(2, '0');

              return (
                <div key={service.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                  {/* Service Row Button */}
                  <button
                    id={`service-item-${index}`}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={0}
                    onClick={() => setActiveIndex(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="group w-full flex items-center justify-between text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A46D] rounded-sm"
                    style={{
                      padding: '26px 8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 'clamp(21px, 2.3vw, 30px)',
                        fontWeight: 400,
                        color: isActive ? COLORS.accent : COLORS.text,
                        transition: 'color 0.2s ease',
                      }}
                      className="group-hover:text-[#D7BC8C]"
                    >
                      {service.name}
                    </span>

                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12.5,
                        letterSpacing: '0.12em',
                        color: isActive ? COLORS.accent : COLORS.secondary,
                        transition: 'color 0.2s ease',
                      }}
                      className="group-hover:text-[#D7BC8C]"
                    >
                      {formattedNumber}
                    </span>
                  </button>

                  {/* Mobile Accordion Detail (< 1024px) */}
                  <div className="lg:hidden">
                    <AnimatePresence initial={false}>
                      {isActive && (
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
                            <p
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 14,
                                color: COLORS.secondary,
                                lineHeight: 1.65,
                                marginBottom: 20,
                              }}
                            >
                              {service.description}
                            </p>

                            <div style={{ paddingTop: 16, borderTop: `1px solid ${COLORS.line}` }}>
                              <div
                                style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                  fontSize: 10.5,
                                  letterSpacing: '0.14em',
                                  textTransform: 'uppercase',
                                  color: COLORS.accent,
                                  marginBottom: 12,
                                }}
                              >
                                Core Capabilities
                              </div>
                              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                                {service.capabilities.map((cap) => (
                                  <li
                                    key={cap}
                                    style={{
                                      fontFamily: "'Inter', sans-serif",
                                      fontSize: 13,
                                      color: COLORS.text,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 9,
                                    }}
                                  >
                                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: COLORS.accent, flexShrink: 0 }} />
                                    <span>{cap}</span>
                                  </li>
                                ))}
                              </ul>
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

          {/* Right Column — Desktop Floating Active Detail Panel (>= 1024px) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-32">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: COLORS.card,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 18,
                  padding: '36px 32px',
                  boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
                }}
              >
                {/* Header label */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 16,
                    marginBottom: 20,
                    borderBottom: `1px solid ${COLORS.line}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: COLORS.accent,
                    }}
                  >
                    Service {String(activeIndex + 1).padStart(2, '0')} // Capability
                  </span>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: COLORS.accent,
                      display: 'inline-block',
                    }}
                  />
                </div>

                {/* Service Title */}
                <h3
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: 'clamp(24px, 2vw, 30px)',
                    fontWeight: 400,
                    color: COLORS.text,
                    lineHeight: 1.25,
                    marginBottom: 14,
                  }}
                >
                  {activeService.name}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14.5,
                    color: COLORS.secondary,
                    lineHeight: 1.65,
                    marginBottom: 28,
                  }}
                >
                  {activeService.description}
                </p>

                {/* Capabilities list */}
                <div style={{ paddingTop: 22, borderTop: `1px solid ${COLORS.line}` }}>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: COLORS.accent,
                      marginBottom: 14,
                    }}
                  >
                    Core Capabilities
                  </div>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    {activeService.capabilities.map((cap) => (
                      <li
                        key={cap}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13.5,
                          color: COLORS.text,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            background: COLORS.accent,
                            flexShrink: 0,
                          }}
                        />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct CTA */}
                <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${COLORS.line}` }}>
                  <button
                    onClick={() => {
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11.5,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: COLORS.accent,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'color 0.2s ease',
                    }}
                    className="hover:text-[#D7BC8C]"
                  >
                    <span>Inquire for your business</span>
                    <span>→</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
