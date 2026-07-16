import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
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
  { name: 'Custom Software', icon: Code2, description: 'Bespoke applications built around your exact workflow and business logic.' },
  { name: 'Admin Dashboards', icon: LayoutDashboard, description: 'Real-time control panels for operations, analytics, and team management.' },
  { name: 'Booking Platforms', icon: CalendarClock, description: 'Availability-aware booking engines with instant confirmation and payments.' },
  { name: 'Business Automation', icon: Zap, description: 'Eliminate repetitive tasks with intelligent, event-driven workflows.' },
  { name: 'Business Websites', icon: Globe, description: 'Premium, high-performance public-facing sites that convert visitors.' },
  { name: 'Cloud Deployment', icon: Cloud, description: 'Zero-downtime releases with CDN, SSL, load balancing, and monitoring.' },
  { name: 'Supabase Integration', icon: Database, description: 'Real-time databases, secure auth, and edge functions — production-ready.' },
  { name: 'Responsive Design', icon: MonitorSmartphone, description: 'Fluid layouts ensuring every screen and device looks pixel-perfect.' },
];

export function Services() {
  return (
    <section style={{ padding: '140px 5%', background: COLORS.bg }} id="services">
      <Reveal>
        <Eyebrow>Services</Eyebrow>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: 'clamp(32px, 4vw, 52px)',
            color: COLORS.text,
            marginBottom: 80,
            maxWidth: 500,
            lineHeight: 1.1,
          }}
        >
          What you can hand us.
        </h2>
      </Reveal>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {SERVICES.map((s, i) => (
          <Reveal delay={i * 0.05} key={s.name}>
            <ServiceCard service={s} />
          </Reveal>
        ))}
      </div>
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

  return (
    <div
      onMouseMove={handleMouseMove}
      className="group relative flex h-full flex-col justify-start overflow-hidden rounded-2xl transition-all duration-500"
      style={{
        background: 'rgba(18, 16, 14, 0.4)',
        border: '1px solid rgba(255,255,255,0.04)',
        padding: '36px 32px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* Subtle background glow that follows the mouse */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(201, 168, 118, 0.06), transparent 80%)`,
        }}
      />
      
      {/* High-contrast border glow that follows the mouse */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: useMotionTemplate`inset 0 0 0 1.5px rgba(201, 168, 118, 0.5)`,
          maskImage: useMotionTemplate`radial-gradient(250px circle at ${mouseX}px ${mouseY}px, black, transparent 80%)`,
          WebkitMaskImage: useMotionTemplate`radial-gradient(250px circle at ${mouseX}px ${mouseY}px, black, transparent 80%)`,
        }}
      />
      
      <div 
        className="relative z-10 flex items-center justify-center rounded-xl mb-7 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(201,168,118,0.2)]"
        style={{
          width: 56,
          height: 56,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#c9a876',
        }}
      >
        <service.icon size={26} strokeWidth={1.5} />
      </div>

      <div
        className="relative z-10 transition-colors duration-300"
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 22,
          color: '#fff',
          marginBottom: 12,
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
        }}
      >
        {service.name}
      </div>

      <p
        className="relative z-10 m-0 transition-colors duration-300 group-hover:text-[rgba(255,255,255,0.85)]"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.6,
        }}
      >
        {service.description}
      </p>
    </div>
  );
}