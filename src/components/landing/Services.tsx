import { m as motion } from 'framer-motion';
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
  MonitorSmartphone 
} from 'lucide-react';

const SERVICES = [
  { name: 'Internal Tools', icon: Code2, description: 'We build the exact software your team needs to work faster, instead of forcing you to use clunky off-the-shelf apps.', bento: 'bento-1', size: 'wide' },
  { name: 'Admin Dashboards', icon: LayoutDashboard, description: 'A single control panel where you can see exactly what\'s happening in your business and manage everything in one place.', bento: 'bento-2', size: 'wide' },
  { name: 'Custom Booking', icon: CalendarClock, description: 'Systems that let your customers schedule and pay for your services online, completely hands-free.', bento: 'bento-3', size: 'normal' },
  { name: 'Automating Busywork', icon: Zap, description: 'If you\'re copying and pasting data all day, we write scripts to do it for you automatically in the background.', bento: 'bento-4', size: 'normal' },
  { name: 'Marketing Sites', icon: Globe, description: 'Fast, custom-built websites that look professional, load instantly, and actually convince people to contact you.', bento: 'bento-5', size: 'normal' },
  { name: 'Cloud Infrastructure', icon: Cloud, description: 'We put your software on reliable servers so it stays online, and we handle all the maintenance.', bento: 'bento-6', size: 'normal' },
  { name: 'Database & Security', icon: Database, description: 'We set up secure, modern databases to store your business data safely, complete with proper user logins and backups.', bento: 'bento-7', size: 'wide' },
  { name: 'Mobile Ready', icon: MonitorSmartphone, description: 'Everything we build works perfectly on your phone, so you can run your business while you\'re away from your desk.', bento: 'bento-8', size: 'wide' },
];

export function Services() {
  return (
    <section style={{ padding: '160px 5%', background: COLORS.bg }} id="services">
      <Reveal>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Eyebrow>Capabilities</Eyebrow>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              fontSize: 'clamp(32px, 4.5vw, 56px)',
              color: COLORS.text,
              marginBottom: 72,
              maxWidth: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em'
            }}
          >
            What you can hand us.
          </h2>
        </div>
      </Reveal>
      <div className="dk-bento-grid max-w-[1200px] mx-auto">
        {SERVICES.map((s, i) => (
          <Reveal delay={i * 0.05} key={s.name} className={s.bento} style={{ height: '100%' }}>
            <ServiceCard service={s} />
          </Reveal>
        ))}
      </div>
      
      <style>{`
        .dk-bento-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .dk-bento-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-auto-rows: minmax(220px, auto);
          }
        }
        @media (min-width: 1024px) {
          .dk-bento-grid {
            grid-template-columns: repeat(4, 1fr);
            grid-auto-rows: minmax(220px, auto);
            gap: 20px;
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
  const isLarge = service.size === 'large';
  const isWide = service.size === 'wide' || service.size === 'wide-large';

  // Responsive layout classes
  const flexStyle = isWide ? 'flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8' : 'flex-col justify-start';
  const paddingStyle = isLarge ? '44px 40px' : isWide ? '36px 36px' : '32px 28px';

  return (
    <motion.div
      className={`group relative flex h-full w-full overflow-hidden rounded-2xl transition-all duration-300 ${flexStyle}`}
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.line}`,
        padding: paddingStyle,
      }}
      whileHover={{ 
        y: -3, 
        borderColor: '#3A372E',
      }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
    >
      <div 
        className={`relative z-10 flex items-center justify-center shrink-0 rounded-xl transition-colors duration-300 ${isLarge ? 'mb-8 lg:mb-10' : isWide ? 'mb-6 lg:mb-0' : 'mb-6'}`}
        style={{
          width: 48,
          height: 48,
          background: 'rgba(25, 25, 22, 0.8)',
          border: `1px solid ${COLORS.line}`,
          color: COLORS.accent,
        }}
      >
        <service.icon size={22} strokeWidth={1.6} />
      </div>

      <div className={`relative z-10 ${isWide ? 'flex flex-col justify-center' : ''}`}>
        <h3
          className="transition-colors duration-200 group-hover:text-[#C5A46D]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: isLarge ? 28 : isWide ? 22 : 20,
            color: COLORS.text,
            marginBottom: 10,
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
            fontWeight: 400,
          }}
        >
          {service.name}
        </h3>

        <p
          className="m-0"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: COLORS.secondary,
            lineHeight: 1.6,
          }}
        >
          {service.description}
        </p>
      </div>
    </motion.div>
  );
}
