import React from 'react';
import { motion } from 'framer-motion';

const LOCATIONS = [
  {
    country: 'INDIA',
    subtitle: 'Software Engineering',
    features: ['Custom Websites', 'Business Software', 'AI Automation'],
  },
  {
    country: 'KUWAIT',
    subtitle: 'Digital Transformation',
    features: ['Enterprise Solutions', 'CRM Systems', 'Workflow Automation'],
  },
  {
    country: 'AUSTRALIA',
    subtitle: 'Custom Software',
    features: ['SaaS Products', 'Cloud Applications', 'AI Integrations'],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1] 
    }
  },
};

export function GlobalPresence() {
  return (
    <section className="relative w-full bg-[#050505] py-32 overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Background gradients & soft noise */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(15,23,42,0.4),transparent_70%)]" />
        <div 
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} 
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl px-6 md:px-12 mx-auto">
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <h2 className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A1A1AA] mb-4 uppercase">
            Global Presence
          </h2>
          <p className="text-3xl md:text-4xl lg:text-[40px] font-medium tracking-tight text-[#F5F5F5]">
            Engineering software across borders.
          </p>
        </motion.div>

        {/* Cards Layout: flex-wrap for 2+1 layout on tablet */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-wrap justify-center gap-6"
        >
          {LOCATIONS.map((loc, index) => (
            <LocationCard key={loc.country} location={loc} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function LocationCard({ location }: { location: typeof LOCATIONS[0] }) {
  return (
    <motion.div
      variants={cardVariants}
      className="
        group relative flex flex-col w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] 
        bg-[#101010] rounded-[20px] p-8 lg:p-10
        border border-white/[0.08]
        transition-all duration-500 ease-out
        hover:-translate-y-2 hover:bg-[#141414] 
        hover:border-[#C8A45C]/30 hover:shadow-[0_0_30px_rgba(200,164,92,0.06)]
      "
    >
      {/* Subtle top reflection simulating metallic edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Micro Animation: Pulsing Dot */}
      <div className="absolute top-10 right-10 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-[#C8A45C] opacity-70" />
        <div className="absolute w-2 h-2 rounded-full bg-[#C8A45C] animate-[ping_4s_ease-in-out_infinite] opacity-30" />
      </div>

      <div className="mb-14">
        <h3 className="text-2xl lg:text-3xl font-medium text-[#F5F5F5] tracking-tight mb-2">
          {location.country}
        </h3>
        <p className="text-[#A1A1AA] text-sm font-medium tracking-wide">
          {location.subtitle}
        </p>
      </div>

      <ul className="mt-auto space-y-4">
        {location.features.map((feature, i) => (
          <li key={i} className="flex items-center text-[15px] text-[#A1A1AA] tracking-tight">
            <span className="flex-shrink-0 w-1 h-1 rounded-full bg-[#C8A45C]/40 mr-4 transition-colors duration-300 group-hover:bg-[#C8A45C]" />
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
