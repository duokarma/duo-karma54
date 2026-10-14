import { m as motion } from 'framer-motion';
import { COLORS } from './ui/theme';

const APPLE_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// Original sequential delays for dramatic one-by-one country introduction
const TIMINGS = {
  line1: 1.0,
  node1: 1.7,
  line2: 1.7,
  node2: 2.4,
  line3: 2.4,
  node3: 3.1,
  line4: 3.1,
  node4: 3.8,
  line5: 3.8,
  node5: 4.5,
  shimmer: 6.0,
  finalText: 7.0,
};

const drawLine = (drawDelay: number, shimmerDelay: number) => {
  const duration = shimmerDelay - drawDelay + 1.5;
  return {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: [0, 1, 1, 0.35, 1],
      strokeWidth: [1, 1, 1, 2, 1],
      transition: {
        pathLength: { duration: 1.8, delay: drawDelay, ease: APPLE_EASE },
        opacity: { duration, times: [0, 0.1, 0.85, 0.92, 1], delay: drawDelay, ease: 'easeInOut' as any },
        strokeWidth: { duration, times: [0, 0.1, 0.85, 0.92, 1], delay: drawDelay, ease: 'easeInOut' as any },
      },
    },
  };
};

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, delay, ease: APPLE_EASE } },
});

const nodeVariants = (delay: number) => ({
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.8, delay, ease: APPLE_EASE } },
});

const pulseVariants = (delay: number) => ({
  hidden: { scale: 0.1, opacity: 0 },
  visible: {
    scale: [0.1, 2.5],
    opacity: [0, 0.55, 0],
    transition: { duration: 3.5, delay, repeat: Infinity, ease: 'easeOut' as any },
  },
});

export function GlobalPresence() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="relative w-full flex items-center justify-center overflow-hidden font-sans py-10 md:py-16"
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

      {/* MOBILE LAYOUT (< 768px) — Original Sequential S-Curve Flow */}
      <div className="md:hidden relative w-full max-w-[420px] h-[1050px] mx-auto z-10">
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
      <motion.div variants={fadeUp(TIMINGS.finalText)} className="absolute left-[50%] top-[8%] -translate-x-1/2 flex flex-col items-center whitespace-nowrap text-center">
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
        {/* Animated Cybernetic Lines in Ice-Blue — drawing one by one */}
        <motion.path d="M 600,400 C 450,400 350,250 250,250" fill="none" stroke="#AFDDFF" className="opacity-80" variants={drawLine(TIMINGS.line1, TIMINGS.shimmer)} />
        <motion.path d="M 600,400 C 750,400 850,250 950,250" fill="none" stroke="#AFDDFF" className="opacity-80" variants={drawLine(TIMINGS.line2, TIMINGS.shimmer)} />
        <motion.path d="M 600,400 C 450,400 300,550 200,550" fill="none" stroke="#AFDDFF" className="opacity-80" variants={drawLine(TIMINGS.line3, TIMINGS.shimmer)} />
        <motion.path d="M 600,400 C 750,400 900,550 1000,550" fill="none" stroke="#AFDDFF" className="opacity-80" variants={drawLine(TIMINGS.line4, TIMINGS.shimmer)} />
        <motion.path d="M 600,400 C 600,500 600,600 600,700" fill="none" stroke="#AFDDFF" className="opacity-80" variants={drawLine(TIMINGS.line5, TIMINGS.shimmer)} />

        {/* Nodes in Ice-Blue */}
        <g>
          <motion.circle cx="250" cy="250" r="3.5" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node1)} />
          <motion.circle cx="250" cy="250" r="3.5" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node1)} />
        </g>
        <g>
          <motion.circle cx="950" cy="250" r="3.5" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node2)} />
          <motion.circle cx="950" cy="250" r="3.5" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node2)} />
        </g>
        <g>
          <motion.circle cx="200" cy="550" r="3.5" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node3)} />
          <motion.circle cx="200" cy="550" r="3.5" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node3)} />
        </g>
        <g>
          <motion.circle cx="1000" cy="550" r="3.5" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node4)} />
          <motion.circle cx="1000" cy="550" r="3.5" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node4)} />
        </g>
        <g>
          <motion.circle cx="600" cy="700" r="3.5" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node5)} />
          <motion.circle cx="600" cy="700" r="3.5" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node5)} />
        </g>
      </svg>

      {/* Center Emblem */}
      <LogoOverlay className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2" />
      
      {/* 1. India */}
      <motion.div variants={fadeUp(TIMINGS.node1)} className="absolute left-[20.8%] top-[31.25%] -translate-x-1/2 -translate-y-[135%] flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-3 mb-1 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/in.svg" alt="India" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[19px] font-medium tracking-[0.15em] text-[#F5F5F5]">INDIA</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[14px] tracking-wide">Engineering Digital Products</p>
      </motion.div>

      {/* 2. Kuwait */}
      <motion.div variants={fadeUp(TIMINGS.node2)} className="absolute left-[79.1%] top-[31.25%] -translate-x-1/2 -translate-y-[135%] flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-3 mb-1 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/kw.svg" alt="Kuwait" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[19px] font-medium tracking-[0.15em] text-[#F5F5F5]">KUWAIT</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[14px] tracking-wide">Business Automation</p>
      </motion.div>

      {/* 3. Australia */}
      <motion.div variants={fadeUp(TIMINGS.node3)} className="absolute left-[16.6%] top-[68.75%] -translate-x-1/2 pt-5 flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-3 mb-1 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/au.svg" alt="Australia" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[19px] font-medium tracking-[0.15em] text-[#F5F5F5]">AUSTRALIA</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[14px] tracking-wide">Scalable SaaS Solutions</p>
      </motion.div>

      {/* 4. Dubai */}
      <motion.div variants={fadeUp(TIMINGS.node4)} className="absolute left-[83.3%] top-[68.75%] -translate-x-1/2 pt-5 flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-3 mb-1 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/ae.svg" alt="Dubai" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[19px] font-medium tracking-[0.15em] text-[#F5F5F5]">DUBAI</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[14px] tracking-wide">Digital Transformation</p>
      </motion.div>

      {/* 5. USA */}
      <motion.div variants={fadeUp(TIMINGS.node5)} className="absolute left-[50%] top-[87.5%] -translate-x-1/2 pt-5 flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-3 mb-1 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/us.svg" alt="USA" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[19px] font-medium tracking-[0.15em] text-[#F5F5F5]">USA</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[14px] tracking-wide">Enterprise Innovation</p>
      </motion.div>
    </>
  );
}

function MobileAnimation() {
  return (
    <>
      <svg viewBox="0 0 400 1100" className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Animated S-Curves in Ice-Blue — drawing sequentially one by one */}
        <motion.path d="M 200,80 C 250,130 150,180 200,220" fill="none" stroke="#AFDDFF" className="opacity-80" variants={drawLine(TIMINGS.line1, TIMINGS.shimmer)} />
        <motion.path d="M 200,310 C 150,340 250,380 200,410" fill="none" stroke="#AFDDFF" className="opacity-80" variants={drawLine(TIMINGS.line2, TIMINGS.shimmer)} />
        <motion.path d="M 200,500 C 250,530 150,570 200,600" fill="none" stroke="#AFDDFF" className="opacity-80" variants={drawLine(TIMINGS.line3, TIMINGS.shimmer)} />
        <motion.path d="M 200,690 C 150,720 250,760 200,790" fill="none" stroke="#AFDDFF" className="opacity-80" variants={drawLine(TIMINGS.line4, TIMINGS.shimmer)} />
        <motion.path d="M 200,880 C 250,910 150,950 200,980" fill="none" stroke="#AFDDFF" className="opacity-80" variants={drawLine(TIMINGS.line5, TIMINGS.shimmer)} />

        {/* Nodes in Ice-Blue */}
        <g>
          <motion.circle cx="200" cy="220" r="3.5" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node1)} />
          <motion.circle cx="200" cy="220" r="3.5" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node1)} />
        </g>
        <g>
          <motion.circle cx="200" cy="410" r="3.5" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node2)} />
          <motion.circle cx="200" cy="410" r="3.5" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node2)} />
        </g>
        <g>
          <motion.circle cx="200" cy="600" r="3.5" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node3)} />
          <motion.circle cx="200" cy="600" r="3.5" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node3)} />
        </g>
        <g>
          <motion.circle cx="200" cy="790" r="3.5" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node4)} />
          <motion.circle cx="200" cy="790" r="3.5" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node4)} />
        </g>
        <g>
          <motion.circle cx="200" cy="980" r="3.5" fill="#AFDDFF" variants={nodeVariants(TIMINGS.node5)} />
          <motion.circle cx="200" cy="980" r="3.5" fill="none" stroke="#AFDDFF" strokeWidth="1" variants={pulseVariants(TIMINGS.node5)} />
        </g>
      </svg>

      {/* Top Center Emblem */}
      <LogoOverlay className="absolute left-[50%] top-[6%] -translate-x-1/2 -translate-y-1/2 scale-[0.8]" />

      {/* 1. India */}
      <motion.div variants={fadeUp(TIMINGS.node1)} className="absolute left-[50%] top-[20%] -translate-x-1/2 flex flex-col items-center whitespace-nowrap text-center pt-1">
        <div className="flex items-center gap-2 mb-1 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/in.svg" alt="India" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[17px] font-medium tracking-[0.15em] text-[#F5F5F5]">INDIA</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[12px] tracking-wide">Engineering Digital Products</p>
      </motion.div>

      {/* 2. Kuwait */}
      <motion.div variants={fadeUp(TIMINGS.node2)} className="absolute left-[50%] top-[37%] -translate-x-1/2 flex flex-col items-center whitespace-nowrap text-center pt-1">
        <div className="flex items-center gap-2 mb-1 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/kw.svg" alt="Kuwait" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[17px] font-medium tracking-[0.15em] text-[#F5F5F5]">KUWAIT</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[12px] tracking-wide">Business Automation</p>
      </motion.div>

      {/* 3. Australia */}
      <motion.div variants={fadeUp(TIMINGS.node3)} className="absolute left-[50%] top-[54%] -translate-x-1/2 flex flex-col items-center whitespace-nowrap text-center pt-1">
        <div className="flex items-center gap-2 mb-1 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/au.svg" alt="Australia" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[17px] font-medium tracking-[0.15em] text-[#F5F5F5]">AUSTRALIA</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[12px] tracking-wide">Scalable SaaS Solutions</p>
      </motion.div>

      {/* 4. Dubai */}
      <motion.div variants={fadeUp(TIMINGS.node4)} className="absolute left-[50%] top-[71%] -translate-x-1/2 flex flex-col items-center whitespace-nowrap text-center pt-1">
        <div className="flex items-center gap-2 mb-1 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/ae.svg" alt="Dubai" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[17px] font-medium tracking-[0.15em] text-[#F5F5F5]">DUBAI</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[12px] tracking-wide">Digital Transformation</p>
      </motion.div>

      {/* 5. USA */}
      <motion.div variants={fadeUp(TIMINGS.node5)} className="absolute left-[50%] top-[88%] -translate-x-1/2 flex flex-col items-center whitespace-nowrap text-center pt-1">
        <div className="flex items-center gap-2 mb-1 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
          <img src="https://flagcdn.com/us.svg" alt="USA" className="w-5 object-contain rounded-[2px] opacity-90 shadow-sm" />
          <span className="text-[17px] font-medium tracking-[0.15em] text-[#F5F5F5]">USA</span>
        </div>
        <p className="text-[#AFDDFF]/80 font-light text-[12px] tracking-wide">Enterprise Innovation</p>
      </motion.div>

      {/* Final Story Text at bottom */}
      <motion.div variants={fadeUp(TIMINGS.finalText)} className="absolute left-[50%] top-[97%] -translate-x-1/2 flex flex-col items-center whitespace-nowrap w-full">
        <p 
          className="text-[16px] font-normal tracking-[0.05em] text-center"
          style={{
            fontFamily: "'Fraunces', serif",
            background: 'linear-gradient(135deg, #FFFFFF 30%, #D8EDFF 70%, #AFDDFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Building software beyond borders.
        </p>
      </motion.div>
    </>
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
        {/* Soft Ambient Ice-Blue Aura */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1.35, transition: { duration: 2.5, delay: 0.5, ease: APPLE_EASE } }
          }}
          className="absolute inset-0 bg-[#AFDDFF] blur-[45px] opacity-[0.25] rounded-full"
        />
        {/* Logo Image container */}
        <div className="relative z-10 w-[96px] h-[96px] rounded-full border border-[#AFDDFF]/25 shadow-[0_0_35px_rgba(175,221,255,0.2)] overflow-hidden bg-[#0a0d14] p-1 flex items-center justify-center">
          <img src="/duokarma-logo.jpeg" alt="DuoKarma" className="w-full h-full object-cover rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}
