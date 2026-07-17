import { m as motion, useMotionTemplate, useMotionValue } from 'framer-motion';
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
              fontSize: 'clamp(36px, 5vw, 64px)',
              color: COLORS.text,
              marginBottom: 80,
              maxWidth: 700,
              lineHeight: 1.1,
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
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const isLarge = service.size === 'large';
  const isTall = service.size === 'tall';
  const isWide = service.size === 'wide' || service.size === 'wide-large';

  // Responsive layout classes
  const flexStyle = isWide ? 'flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10' : 'flex-col justify-start';
  const paddingStyle = isLarge ? '40px' : isWide ? '32px 40px' : '28px';

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      className={`group relative flex h-full w-full overflow-hidden rounded-[32px] transition-all duration-700 ${flexStyle}`}
      style={{
        background: 'linear-gradient(135deg, rgba(22, 20, 18, 0.7) 0%, rgba(12, 11, 10, 0.9) 100%)',
        border: '1px solid rgba(255,255,255,0.04)',
        padding: paddingStyle,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02), 0 20px 40px rgba(0,0,0,0.3)',
      }}
      whileHover={{ y: -6, scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Permanent subtle ambient glow so it looks good on mobile without hover */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none transition-opacity duration-500 group-hover:opacity-0"
        style={{
          background: 'radial-gradient(circle at 10% 10%, rgba(201, 168, 118, 0.8), transparent 60%)',
        }}
      />

      {/* Background ambient glow for Large card */}
      {isLarge && (
        <motion.div
          className="absolute -right-20 -top-20 z-0 h-[400px] w-[400px] rounded-full blur-[100px] opacity-20 pointer-events-none"
          style={{ background: '#c9a876' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      
      {/* Subtle grid pattern for Tall card */}
      {isTall && (
        <div 
          className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none mix-blend-overlay" 
          style={{ 
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
            backgroundSize: '24px 24px' 
          }} 
        />
      )}

      {/* Mouse-tracking background glow (Desktop only, via hover opacity) */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(201, 168, 118, 0.08), transparent 80%)`,
          zIndex: 1,
        }}
      />
      
      {/* Mouse-tracking border glow (Desktop only) */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[32px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: useMotionTemplate`inset 0 0 0 1.5px rgba(201, 168, 118, 0.6)`,
          maskImage: useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black, transparent 80%)`,
          WebkitMaskImage: useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black, transparent 80%)`,
          zIndex: 2,
        }}
      />
      
      {/* Permanent glowing ring around the card (very subtle) to look premium on mobile */}
      <div 
        className="pointer-events-none absolute inset-0 rounded-[32px] opacity-20 z-0 transition-opacity duration-500 group-hover:opacity-0"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(201, 168, 118, 0.3)' }}
      />
      
      <div 
        className={`relative z-10 flex items-center justify-center shrink-0 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(201,168,118,0.3)] ${isLarge ? 'mb-8 lg:mb-10' : isTall ? 'mb-auto' : isWide ? 'mb-6 lg:mb-0' : 'mb-6 lg:mb-8'}`}
        style={{
          width: isLarge ? 80 : 56,
          height: isLarge ? 80 : 56,
          background: 'linear-gradient(135deg, rgba(201,168,118,0.15) 0%, rgba(201,168,118,0.02) 100%)',
          border: '1px solid rgba(201,168,118,0.3)',
          color: '#c9a876',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        <service.icon size={isLarge ? 34 : 26} strokeWidth={1.5} />
      </div>

      <div className={`relative z-10 ${isWide ? 'flex flex-col justify-center' : ''} ${isTall ? 'mt-8' : ''}`}>
        <h3
          className="transition-colors duration-300 group-hover:text-[rgba(201,168,118,1)]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: isLarge ? 32 : isWide ? 24 : 22,
            color: '#fff',
            marginBottom: isLarge ? 16 : 10,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {service.name}
        </h3>

        <p
          className="m-0 transition-colors duration-300 group-hover:text-[rgba(255,255,255,0.9)]"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: isLarge ? 16 : 14.5,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.6,
          }}
        >
          {service.description}
        </p>
      </div>
    </motion.div>
  );
}
