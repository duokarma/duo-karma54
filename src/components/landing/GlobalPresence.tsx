import { useState } from 'react';
import { m as motion } from 'framer-motion';
import { COLORS } from './ui/theme';

const APPLE_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// Delays in seconds
const TIMINGS = {
  line1: 0.8,
  node1: 1.4,
  line2: 1.4,
  node2: 2.0,
  line3: 2.0,
  node3: 2.6,
  line4: 2.6,
  node4: 3.2,
  line5: 3.2,
  node5: 3.8,
  shimmer: 5.0,
  finalText: 5.6,
};

const drawLine = (drawDelay: number, shimmerDelay: number) => {
  const duration = shimmerDelay - drawDelay + 1.5;
  return {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: [0, 0.9, 0.9, 0.4, 0.9],
      strokeWidth: [1, 1, 1, 1.8, 1],
      transition: {
        pathLength: { duration: 1.6, delay: drawDelay, ease: APPLE_EASE },
        opacity: { duration, times: [0, 0.1, 0.85, 0.92, 1], delay: drawDelay, ease: 'easeInOut' as any },
        strokeWidth: { duration, times: [0, 0.1, 0.85, 0.92, 1], delay: drawDelay, ease: 'easeInOut' as any },
      },
    },
  };
};

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.0, delay, ease: APPLE_EASE } },
});

const nodeVariants = (delay: number) => ({
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.7, delay, ease: APPLE_EASE } },
});

const pulseVariants = (delay: number) => ({
  hidden: { scale: 0.1, opacity: 0 },
  visible: {
    scale: [0.1, 2.4],
    opacity: [0, 0.5, 0],
    transition: { duration: 3.2, delay, repeat: Infinity, ease: 'easeOut' as any },
  },
});

export function GlobalPresence() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="relative w-full flex items-center justify-center overflow-hidden font-sans py-8 md:py-16"
      style={{ background: COLORS.bg }}
      id="presence"
    >
      {/* Top seamless portal connection to Services */}
      <div 
        className="pointer-events-none absolute top-0 left-0 right-0 h-24 z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(175, 221, 255, 0.05) 0%, transparent 100%)',
        }}
      />
      <div 
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[85%] max-w-[900px] h-[1px] z-10"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(175, 221, 255, 0.25) 50%, transparent 100%)',
          boxShadow: '0 0 16px rgba(175, 221, 255, 0.2)',
        }}
      />

      {/* Atmospheric Aurora Environment — continuous ice-blue glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(175, 221, 255, 0.12) 0%, rgba(10, 16, 26, 0.4) 50%, transparent 75%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
        />
      </div>

      {/* DESKTOP LAYOUT (>= 768px) */}
      <div className="hidden md:block relative w-full max-w-[1200px] aspect-[12/8] mx-auto z-10">
        <DesktopAnimation />
      </div>

      {/* MOBILE LAYOUT (< 768px) */}
      <div className="md:hidden relative w-full max-w-[500px] mx-auto z-10">
        <MobileAnimation />
      </div>

      {/* Bottom seamless portal connection to Process */}
      <div 
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 z-10"
        style={{
          background: 'linear-gradient(to top, rgba(175, 221, 255, 0.04) 0%, transparent 100%)',
        }}
      />
      <div 
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] max-w-[900px] h-[1px] z-10"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(175, 221, 255, 0.2) 50%, transparent 100%)',
        }}
      />
    </motion.section>
  );
}

function DesktopAnimation() {
  return (
    <>
      {/* Final Story Text positioned at the TOP */}
      <motion.div variants={fadeUp(TIMINGS.finalText)} className="absolute left-[50%] top-[10%] -translate-x-1/2 flex flex-col items-center whitespace-nowrap">
        <p 
          className="text-[24px] font-normal tracking-[0.05em] text-white"
          style={{
            fontFamily: "'Fraunces', serif",
            background: 'linear-gradient(135deg, #FFFFFF 30%, #D8EDFF 70%, #AFDDFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Building software beyond borders.
        </p>
        <p className="text-xs text-white/50 font-sans mt-1">
          Deploying world-class platforms for teams across 5 countries.
        </p>
      </motion.div>

      <svg viewBox="0 0 1200 800" className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Animated Cybernetic Lines in Ice-Blue */}
        <motion.path d="M 600,400 C 450,400 350,250 250,250" fill="none" stroke="#AFDDFF" strokeOpacity="0.6" variants={drawLine(TIMINGS.line1, TIMINGS.shimmer)} />
        <motion.path d="M 600,400 C 750,400 850,250 950,250" fill="none" stroke="#AFDDFF" strokeOpacity="0.6" variants={drawLine(TIMINGS.line2, TIMINGS.shimmer)} />
        <motion.path d="M 600,400 C 450,400 300,550 200,550" fill="none" stroke="#AFDDFF" strokeOpacity="0.6" variants={drawLine(TIMINGS.line3, TIMINGS.shimmer)} />
        <motion.path d="M 600,400 C 750,400 900,550 1000,550" fill="none" stroke="#AFDDFF" strokeOpacity="0.6" variants={drawLine(TIMINGS.line4, TIMINGS.shimmer)} />
        <motion.path d="M 600,400 C 600,500 600,600 600,700" fill="none" stroke="#AFDDFF" strokeOpacity="0.6" variants={drawLine(TIMINGS.line5, TIMINGS.shimmer)} />

        {/* Nodes in Ice-Blue */}
        <g>
          <motion.circle cx="250" cy="250" r="4" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node1)} />
          <motion.circle cx="250" cy="250" r="4" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node1)} />
        </g>
        <g>
          <motion.circle cx="950" cy="250" r="4" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node2)} />
          <motion.circle cx="950" cy="250" r="4" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node2)} />
        </g>
        <g>
          <motion.circle cx="200" cy="550" r="4" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node3)} />
          <motion.circle cx="200" cy="550" r="4" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node3)} />
        </g>
        <g>
          <motion.circle cx="1000" cy="550" r="4" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node4)} />
          <motion.circle cx="1000" cy="550" r="4" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node4)} />
        </g>
        <g>
          <motion.circle cx="600" cy="700" r="4" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node5)} />
          <motion.circle cx="600" cy="700" r="4" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node5)} />
        </g>
      </svg>

      {/* HTML Overlays */}
      <LogoOverlay className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2" />
      
      {/* 1. India */}
      <motion.div variants={fadeUp(TIMINGS.node1)} className="absolute left-[20.8%] top-[31.25%] -translate-x-1/2 -translate-y-[135%] flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-2.5 mb-1 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/in.svg" alt="India" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[17px] font-medium tracking-[0.15em] text-[#F5F5F5]">INDIA</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[13px] tracking-wide">Engineering Digital Products</p>
      </motion.div>

      {/* 2. Kuwait */}
      <motion.div variants={fadeUp(TIMINGS.node2)} className="absolute left-[79.1%] top-[31.25%] -translate-x-1/2 -translate-y-[135%] flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-2.5 mb-1 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/kw.svg" alt="Kuwait" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[17px] font-medium tracking-[0.15em] text-[#F5F5F5]">KUWAIT</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[13px] tracking-wide">Business Automation</p>
      </motion.div>

      {/* 3. Australia */}
      <motion.div variants={fadeUp(TIMINGS.node3)} className="absolute left-[16.6%] top-[68.75%] -translate-x-1/2 pt-4 flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-2.5 mb-1 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/au.svg" alt="Australia" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[17px] font-medium tracking-[0.15em] text-[#F5F5F5]">AUSTRALIA</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[13px] tracking-wide">Scalable SaaS Solutions</p>
      </motion.div>

      {/* 4. Dubai */}
      <motion.div variants={fadeUp(TIMINGS.node4)} className="absolute left-[83.3%] top-[68.75%] -translate-x-1/2 pt-4 flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-2.5 mb-1 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/ae.svg" alt="Dubai" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[17px] font-medium tracking-[0.15em] text-[#F5F5F5]">DUBAI</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[13px] tracking-wide">Digital Transformation</p>
      </motion.div>

      {/* 5. USA */}
      <motion.div variants={fadeUp(TIMINGS.node5)} className="absolute left-[50%] top-[87.5%] -translate-x-1/2 pt-4 flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-2.5 mb-1 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/us.svg" alt="USA" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[17px] font-medium tracking-[0.15em] text-[#F5F5F5]">USA</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[13px] tracking-wide">Enterprise Innovation</p>
      </motion.div>
    </>
  );
}

function MobileAnimation() {
  const [activeIdx, setActiveIdx] = useState(0);
  const hubs = [
    { country: 'USA', role: 'Enterprise Innovation', flag: 'https://flagcdn.com/us.svg', tag: 'Custom Software' },
    { country: 'INDIA', role: 'Engineering Digital Products', flag: 'https://flagcdn.com/in.svg', tag: 'Core Engineering' },
    { country: 'KUWAIT', role: 'Business Automation', flag: 'https://flagcdn.com/kw.svg', tag: 'Workflow Ops' },
    { country: 'AUSTRALIA', role: 'Scalable SaaS Solutions', flag: 'https://flagcdn.com/au.svg', tag: 'Cloud Platforms' },
    { country: 'DUBAI', role: 'Digital Transformation', flag: 'https://flagcdn.com/ae.svg', tag: 'Enterprise Tech' },
  ];

  return (
    <div className="flex flex-col items-center w-full px-4 py-2">
      {/* Central Emblem & Title */}
      <div className="flex flex-col items-center text-center mb-5">
        <LogoOverlay className="mb-3 scale-[0.85]" />
        <h3
          className="text-xl sm:text-2xl font-normal text-white mb-1.5"
          style={{
            fontFamily: "'Fraunces', serif",
            background: 'linear-gradient(135deg, #FFFFFF 30%, #D8EDFF 70%, #AFDDFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Building software beyond borders.
        </h3>
        <p className="text-xs text-ink/70 font-sans max-w-[320px]">
          Deploying world-class platforms for teams across 5 countries.
        </p>
      </div>

      {/* Swipeable Hub Cards */}
      <div
        className="w-full flex gap-3.5 overflow-x-auto snap-x snap-mandatory pb-2 px-1 scrollbar-none"
        onScroll={(e) => {
          const el = e.currentTarget;
          const idx = Math.round(el.scrollLeft / (el.offsetWidth * 0.78));
          setActiveIdx(Math.min(Math.max(idx, 0), hubs.length - 1));
        }}
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {hubs.map((hub) => (
          <div
            key={hub.country}
            className="snap-center shrink-0 w-[78vw] max-w-[290px] rounded-2xl p-4 relative overflow-hidden transition-all duration-300"
            style={{
              background: 'linear-gradient(145deg, rgba(18, 22, 28, 0.88) 0%, rgba(10, 12, 16, 0.98) 100%)',
              border: '1px solid rgba(175, 221, 255, 0.18)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <img src={hub.flag} alt={hub.country} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                <span className="text-sm font-semibold tracking-wider text-white font-mono">{hub.country}</span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AFDDFF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#AFDDFF]"></span>
              </span>
            </div>

            <p className="text-xs text-white/90 font-medium font-sans mb-2">{hub.role}</p>
            <span className="inline-block text-[10px] text-[#AFDDFF] bg-[#AFDDFF]/10 px-2.5 py-0.5 rounded-full border border-[#AFDDFF]/25 font-mono">
              {hub.tag}
            </span>
          </div>
        ))}
      </div>

      {/* Pagination indicators */}
      <div className="flex items-center gap-1.5 mt-2.5">
        {hubs.map((_, i) => (
          <span
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: activeIdx === i ? 22 : 6,
              background: activeIdx === i ? '#AFDDFF' : 'rgba(255, 255, 255, 0.18)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function LogoOverlay({ className = "" }: { className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { scale: 1 },
        visible: { scale: 0.85, transition: { duration: 1.8, ease: APPLE_EASE } }
      }}
      className={`z-20 flex items-center justify-center ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Ambient Ice-Blue Aura */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1.35, transition: { duration: 2.5, delay: 0.5, ease: APPLE_EASE } }
          }}
          className="absolute inset-0 bg-[#AFDDFF] blur-[45px] opacity-[0.25] rounded-full"
        />
        {/* Logo Image container */}
        <div className="relative z-10 w-[92px] h-[92px] rounded-full border border-[#AFDDFF]/25 shadow-[0_0_35px_rgba(175,221,255,0.2)] overflow-hidden bg-[#0a0d14] p-1 flex items-center justify-center">
          <img src="/duokarma-logo.jpeg" alt="DuoKarma" className="w-full h-full object-cover rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}
