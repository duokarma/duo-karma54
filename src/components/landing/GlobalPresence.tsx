import { m as motion } from 'framer-motion';

const LOCATIONS = [
  {
    country: 'INDIA',
    description: 'Custom software engineered for ambitious businesses.',
    capabilities: ['Enterprise Software', 'AI Automation', 'Custom Web Applications'],
  },
  {
    country: 'KUWAIT',
    description: 'Helping businesses automate operations with intelligent software.',
    capabilities: ['Business Automation', 'CRM Systems', 'AI Integration'],
  },
  {
    country: 'AUSTRALIA',
    description: 'Building scalable SaaS platforms and cloud products.',
    capabilities: ['SaaS Development', 'Cloud Applications', 'Product Engineering'],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const blockVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.9, 
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
    }
  },
};

export function GlobalPresence() {
  return (
    <section className="relative w-full bg-[#050505] py-32 md:py-48 overflow-hidden font-sans">
      {/* Background environment: Deep matte black, navy gradient, gold ambient, soft noise */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(15,23,42,0.5),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(200,164,92,0.025),transparent_60%)]" />
        <div 
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} 
        />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] px-6 md:px-12 lg:px-20 mx-auto">
        {/* Editorial Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mb-32 md:mb-40"
        >
          <h2 className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A1A1AA] mb-8 uppercase">
            Global Presence
          </h2>
          <p className="text-4xl md:text-6xl lg:text-[72px] font-medium tracking-tight text-[#F5F5F5] leading-[1.05] mb-10">
            Engineering software beyond borders.
          </p>
          <p className="text-lg md:text-[22px] text-[#A1A1AA] max-w-2xl font-light tracking-wide leading-relaxed">
            Building world-class software for businesses across India, Kuwait and Australia.
          </p>
        </motion.div>

        {/* 3-Column Content Blocks (No Cards) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-12 lg:gap-24"
        >
          {LOCATIONS.map((loc) => (
            <LocationBlock key={loc.country} location={loc} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function LocationBlock({ location }: { location: typeof LOCATIONS[0] }) {
  return (
    <motion.div
      variants={blockVariants}
      className="group relative flex flex-col cursor-default"
    >
      <div className="mb-8">
        <div className="inline-block relative">
          <h3 className="text-[40px] lg:text-[48px] font-medium text-[#F5F5F5] tracking-tight transition-transform duration-700 ease-out group-hover:scale-[1.03] origin-left">
            {location.country}
          </h3>
          {/* Thin gold line animating under title on hover */}
          <div className="absolute -bottom-2 left-0 h-[1px] bg-[#C8A45C] w-0 group-hover:w-full transition-all duration-700 ease-[0.16,1,0.3,1] opacity-70" />
        </div>
      </div>

      {/* Small Gold Divider */}
      <div className="w-8 h-px bg-[rgba(200,164,92,0.4)] mb-8 transition-all duration-700 ease-out group-hover:w-16" />

      {/* Description */}
      <p className="text-[18px] text-[#A1A1AA] font-light leading-relaxed mb-16 transition-transform duration-700 ease-out group-hover:-translate-y-1">
        {location.description}
      </p>

      {/* Capabilities */}
      <div className="mt-auto">
        <ul className="space-y-5">
          {location.capabilities.map((cap, i) => (
            <li key={i} className="flex items-center text-[16px] text-[#E2E8F0] tracking-tight font-light transition-colors duration-500 group-hover:text-[#F5F5F5]">
              {/* Tiny pulsing champagne-gold indicator */}
              <div className="relative w-1.5 h-1.5 mr-6 flex-shrink-0 flex items-center justify-center">
                <span className="absolute w-full h-full rounded-full bg-[#C8A45C] opacity-80" />
                <span className="absolute w-2.5 h-2.5 rounded-full bg-[#C8A45C] opacity-30 animate-[ping_4s_ease-in-out_infinite]" />
              </div>
              {cap}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
