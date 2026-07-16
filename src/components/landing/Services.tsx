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
  { name: 'Internal Tools', icon: Code2, description: 'We build the exact software your team needs to work faster, instead of forcing you to use clunky off-the-shelf apps.' },
  { name: 'Admin Dashboards', icon: LayoutDashboard, description: 'A single control panel where you can see exactly what\'s happening in your business and manage everything in one place.' },
  { name: 'Custom Booking', icon: CalendarClock, description: 'Systems that let your customers schedule and pay for your services online, completely hands-free for you.' },
  { name: 'Automating Busywork', icon: Zap, description: 'If you\'re copying and pasting data all day, we write scripts to do it for you automatically in the background.' },
  { name: 'Marketing Sites', icon: Globe, description: 'Fast, custom-built websites that look professional, load instantly, and actually convince people to contact you.' },
  { name: 'Cloud Infrastructure', icon: Cloud, description: 'We put your software on reliable servers so it stays online when you get busy, and we handle all the maintenance.' },
  { name: 'Database & Security', icon: Database, description: 'We set up secure, modern databases to store your business data safely, complete with proper user logins and backups.' },
  { name: 'Mobile Ready', icon: MonitorSmartphone, description: 'Everything we build works perfectly on your phone, so you can run your business while you\'re away from your desk.' },
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