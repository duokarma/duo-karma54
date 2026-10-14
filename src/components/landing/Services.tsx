import { useState } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';
import { 
  Code2, 
  LayoutDashboard, 
  CalendarClock, 
  Zap, 
  Globe, 
  Cloud, 
  Database, 
  MonitorSmartphone,
  CheckCircle2,
} from 'lucide-react';

const SERVICE_CATEGORIES = [
  { id: 'all', label: 'All Services' },
  { id: 'platforms', label: 'Admin & Tools' },
  { id: 'booking', label: 'Booking & Web' },
  { id: 'automation', label: 'Automation & Cloud' },
];

const SERVICES = [
  {
    category: 'platforms',
    name: 'Internal Tools',
    icon: Code2,
    deliverables: ['Custom workflows', 'Role permissions', 'API integrations'],
    description: "We build the exact software your team needs to work faster, instead of forcing you into clunky off-the-shelf apps.",
    bento: 'bento-1',
    size: 'wide',
  },
  {
    category: 'platforms',
    name: 'Admin Dashboards',
    icon: LayoutDashboard,
    deliverables: ['Live revenue charts', 'Operation metrics', 'Team overview'],
    description: "A single control panel where you can see exactly what's happening in your business and manage everything in one place.",
    bento: 'bento-2',
    size: 'wide',
  },
  {
    category: 'booking',
    name: 'Custom Booking',
    icon: CalendarClock,
    deliverables: ['Availability engine', 'Automated reminders', 'Payment sync'],
    description: "Systems that let your customers schedule and pay for your services online, completely hands-free.",
    bento: 'bento-3',
    size: 'normal',
  },
  {
    category: 'automation',
    name: 'Automating Busywork',
    icon: Zap,
    deliverables: ['Scripted sync', 'WhatsApp bots', 'Zero manual entry'],
    description: "If you're copying and pasting data all day, we write scripts to do it for you automatically in the background.",
    bento: 'bento-4',
    size: 'normal',
  },
  {
    category: 'booking',
    name: 'Marketing Sites',
    icon: Globe,
    deliverables: ['Instant loading', 'High conversion', 'SEO optimized'],
    description: "Fast, custom-built websites that look professional, load instantly, and actually convince people to contact you.",
    bento: 'bento-5',
    size: 'normal',
  },
  {
    category: 'automation',
    name: 'Cloud Infrastructure',
    icon: Cloud,
    deliverables: ['99.9% uptime', 'Automated backups', 'Global CDN'],
    description: "We put your software on reliable servers so it stays online, and we handle all the maintenance.",
    bento: 'bento-6',
    size: 'normal',
  },
  {
    category: 'automation',
    name: 'Database & Security',
    icon: Database,
    deliverables: ['Row-level security', 'Encrypted storage', 'Audit logging'],
    description: "We set up secure, modern databases to store your business data safely, complete with proper user logins and backups.",
    bento: 'bento-7',
    size: 'wide',
  },
  {
    category: 'platforms',
    name: 'Mobile Ready',
    icon: MonitorSmartphone,
    deliverables: ['PWA & touch', 'Real-time push', 'Offline sync'],
    description: "Everything we build works perfectly on your phone, so you can run your business while you're away from your desk.",
    bento: 'bento-8',
    size: 'wide',
  },
];

export function Services() {
  const [selectedCat, setSelectedCat] = useState('all');

  const filteredServices = selectedCat === 'all'
    ? SERVICES
    : SERVICES.filter((s) => s.category === selectedCat);

  return (
    <section
      className="relative overflow-hidden py-16 md:py-36 px-5 md:px-[5%]"
      style={{ background: COLORS.bg }}
      id="services"
    >
      {/* Ambient background glow — ice-blue */}
      <div
        className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[320px] opacity-20"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(175,221,255,0.22), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <Reveal>
        <div className="flex flex-col items-center text-center max-w-[700px] mx-auto mb-10 md:mb-16">
          <Eyebrow>Capabilities</Eyebrow>
          <h2
            className="text-3xl md:text-6xl font-normal tracking-tight mt-2 mb-4"
            style={{
              fontFamily: "'Fraunces', serif",
              background: 'linear-gradient(135deg, #FFFFFF 30%, #D8EDFF 70%, #AFDDFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            What you can hand us.
          </h2>
          <p className="text-sm md:text-base text-ink/60 max-w-[520px] leading-relaxed">
            Full-stack engineering from conception to deployment. No cookie-cutter templates.
          </p>
        </div>
      </Reveal>

      {/* ── CATEGORY PILL SELECTOR ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {SERVICE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCat(cat.id)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer select-none ${
              selectedCat === cat.id
                ? 'bg-[#AFDDFF] text-black font-semibold shadow-[0_4px_20px_rgba(175,221,255,0.35)] scale-105'
                : 'bg-white/5 text-ink/70 border border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of services */}
      <div className={`max-w-[1200px] mx-auto ${
        selectedCat === 'all' ? 'dk-bento-grid' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'
      }`}>
        <AnimatePresence mode="popLayout">
          {filteredServices.map((s) => (
            <motion.div
              layout
              key={s.name}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className={selectedCat === 'all' ? s.bento : ''}
              style={{ height: '100%' }}
            >
              <ServiceCard service={s} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <style>{`
        .dk-bento-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .dk-bento-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }
        @media (min-width: 1024px) {
          .dk-bento-grid {
            grid-template-columns: repeat(4, 1fr);
            grid-auto-rows: minmax(220px, auto);
            gap: 24px;
          }
          .bento-1 { grid-column: span 2; }
          .bento-2 { grid-column: span 2; }
          .bento-3 { grid-column: span 1; }
          .bento-4 { grid-column: span 1; }
          .bento-5 { grid-column: span 1; }
          .bento-6 { grid-column: span 1; }
          .bento-7 { grid-column: span 2; }
          .bento-8 { grid-column: span 2; }
        }
      `}</style>
    </section>
  );
}

function ServiceCard({ service }: { service: typeof SERVICES[0] }) {
  const Icon = service.icon;
  const isWide = service.size === 'wide';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl p-6 md:p-8 transition-all duration-300 ${
        isWide ? 'md:flex-row md:items-center md:gap-8' : ''
      }`}
      style={{
        background: 'linear-gradient(145deg, rgba(18, 22, 28, 0.78) 0%, rgba(10, 12, 16, 0.95) 100%)',
        border: '1px solid rgba(175, 221, 255, 0.14)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex-1">
        {/* Icon & Title Row */}
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#AFDDFF]/10 text-[#AFDDFF] border border-[#AFDDFF]/25 group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
          <h3
            className="text-lg md:text-xl font-normal text-white"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {service.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs md:text-sm text-ink/75 leading-relaxed font-sans mb-4">
          {service.description}
        </p>

        {/* Deliverables Pills */}
        <div className="flex flex-wrap gap-1.5">
          {service.deliverables.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] md:text-[11px] font-sans bg-white/[0.04] text-ink/70 border border-white/5"
            >
              <CheckCircle2 className="w-3 h-3 text-[#AFDDFF]" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
