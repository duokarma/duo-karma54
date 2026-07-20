import { m as motion } from 'framer-motion';

const APPLE_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// Delays in seconds
const TIMINGS = {
  line1: 1.0,
  node1: 2.0,
  line2: 2.5,
  node2: 3.5,
  line3: 4.0,
  node3: 5.0,
  shimmer: 6.5,
  finalText: 7.5,
};

const drawLine = (drawDelay: number, shimmerDelay: number) => {
  const duration = shimmerDelay - drawDelay + 1.5;
  return {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: [0, 1, 1, 0.3, 1],
      strokeWidth: [1, 1, 1, 2, 1],
      transition: {
        pathLength: { duration: 1.8, delay: drawDelay, ease: APPLE_EASE },
        opacity: { duration, times: [0, 0.1, 0.85, 0.92, 1], delay: drawDelay, ease: 'easeInOut' },
        strokeWidth: { duration, times: [0, 0.1, 0.85, 0.92, 1], delay: drawDelay, ease: 'easeInOut' },
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
    opacity: [0, 0.5, 0],
    transition: { duration: 3.5, delay, repeat: Infinity, ease: 'easeOut' },
  },
});

export function GlobalPresence() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="relative w-full bg-[#050505] min-h-screen flex items-center justify-center overflow-hidden font-sans py-24 md:py-0"
    >
      {/* Background Environment */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(15,23,42,0.6),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(200,164,92,0.02),transparent_60%)]" />
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
      <div className="md:hidden relative w-full max-w-[400px] aspect-[4/12] mx-auto z-10">
        <MobileAnimation />
      </div>
    </motion.section>
  );
}

function DesktopAnimation() {
  return (
    <>
      <svg viewBox="0 0 1200 800" className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Animated Lines */}
        <motion.path d="M 600,400 C 450,400 350,250 300,250" fill="none" stroke="#C8A45C" className="opacity-80" variants={drawLine(TIMINGS.line1, TIMINGS.shimmer)} />
        <motion.path d="M 600,400 C 750,400 850,250 900,250" fill="none" stroke="#C8A45C" className="opacity-80" variants={drawLine(TIMINGS.line2, TIMINGS.shimmer)} />
        <motion.path d="M 600,400 C 450,450 450,630 600,680" fill="none" stroke="#C8A45C" className="opacity-80" variants={drawLine(TIMINGS.line3, TIMINGS.shimmer)} />

        {/* Nodes */}
        <g>
          <motion.circle cx="300" cy="250" r="3.5" fill="#C8A45C" variants={nodeVariants(TIMINGS.node1)} />
          <motion.circle cx="300" cy="250" r="3.5" fill="none" stroke="#C8A45C" strokeWidth="1" variants={pulseVariants(TIMINGS.node1)} />
        </g>
        <g>
          <motion.circle cx="900" cy="250" r="3.5" fill="#C8A45C" variants={nodeVariants(TIMINGS.node2)} />
          <motion.circle cx="900" cy="250" r="3.5" fill="none" stroke="#C8A45C" strokeWidth="1" variants={pulseVariants(TIMINGS.node2)} />
        </g>
        <g>
          <motion.circle cx="600" cy="680" r="3.5" fill="#C8A45C" variants={nodeVariants(TIMINGS.node3)} />
          <motion.circle cx="600" cy="680" r="3.5" fill="none" stroke="#C8A45C" strokeWidth="1" variants={pulseVariants(TIMINGS.node3)} />
        </g>
      </svg>

      {/* HTML Overlays */}
      <LogoOverlay className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2" />
      
      {/* India */}
      <motion.div variants={fadeUp(TIMINGS.node1)} className="absolute left-[25%] top-[31.25%] -translate-x-1/2 -translate-y-[135%] flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xl">🇮🇳</span>
          <span className="text-[20px] font-medium tracking-[0.15em] text-[#F5F5F5]">INDIA</span>
        </div>
        <p className="text-[#A1A1AA] font-light text-[15px] tracking-wide">Engineering Digital Products</p>
      </motion.div>

      {/* Kuwait */}
      <motion.div variants={fadeUp(TIMINGS.node2)} className="absolute left-[75%] top-[31.25%] -translate-x-1/2 -translate-y-[135%] flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xl">🇰🇼</span>
          <span className="text-[20px] font-medium tracking-[0.15em] text-[#F5F5F5]">KUWAIT</span>
        </div>
        <p className="text-[#A1A1AA] font-light text-[15px] tracking-wide">Business Automation</p>
      </motion.div>

      {/* Australia */}
      <motion.div variants={fadeUp(TIMINGS.node3)} className="absolute left-[50%] top-[85%] -translate-x-1/2 pt-8 flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xl">🇦🇺</span>
          <span className="text-[20px] font-medium tracking-[0.15em] text-[#F5F5F5]">AUSTRALIA</span>
        </div>
        <p className="text-[#A1A1AA] font-light text-[15px] tracking-wide">Scalable SaaS Solutions</p>
      </motion.div>

      {/* Final Story Text */}
      <motion.div variants={fadeUp(TIMINGS.finalText)} className="absolute left-[50%] top-[66.25%] -translate-x-1/2 flex flex-col items-center whitespace-nowrap">
        <p className="text-[22px] font-light tracking-[0.1em] text-[#F5F5F5] opacity-90">
          Building software beyond borders.
        </p>
      </motion.div>
    </>
  );
}

function MobileAnimation() {
  return (
    <>
      <svg viewBox="0 0 400 1200" className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Animated S-Curves */}
        <motion.path d="M 200,150 C 260,220 140,280 200,350" fill="none" stroke="#C8A45C" className="opacity-80" variants={drawLine(TIMINGS.line1, TIMINGS.shimmer)} />
        <motion.path d="M 200,450 C 140,520 260,580 200,650" fill="none" stroke="#C8A45C" className="opacity-80" variants={drawLine(TIMINGS.line2, TIMINGS.shimmer)} />
        <motion.path d="M 200,750 C 260,820 140,880 200,950" fill="none" stroke="#C8A45C" className="opacity-80" variants={drawLine(TIMINGS.line3, TIMINGS.shimmer)} />

        {/* Nodes */}
        <g>
          <motion.circle cx="200" cy="350" r="3.5" fill="#C8A45C" variants={nodeVariants(TIMINGS.node1)} />
          <motion.circle cx="200" cy="350" r="3.5" fill="none" stroke="#C8A45C" strokeWidth="1" variants={pulseVariants(TIMINGS.node1)} />
        </g>
        <g>
          <motion.circle cx="200" cy="650" r="3.5" fill="#C8A45C" variants={nodeVariants(TIMINGS.node2)} />
          <motion.circle cx="200" cy="650" r="3.5" fill="none" stroke="#C8A45C" strokeWidth="1" variants={pulseVariants(TIMINGS.node2)} />
        </g>
        <g>
          <motion.circle cx="200" cy="950" r="3.5" fill="#C8A45C" variants={nodeVariants(TIMINGS.node3)} />
          <motion.circle cx="200" cy="950" r="3.5" fill="none" stroke="#C8A45C" strokeWidth="1" variants={pulseVariants(TIMINGS.node3)} />
        </g>
      </svg>

      {/* HTML Overlays */}
      <LogoOverlay className="absolute left-[50%] top-[12.5%] -translate-x-1/2 -translate-y-1/2 scale-[0.9]" />

      {/* India */}
      <motion.div variants={fadeUp(TIMINGS.node1)} className="absolute left-[50%] top-[31.6%] -translate-x-1/2 flex flex-col items-center whitespace-nowrap text-center pt-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🇮🇳</span>
          <span className="text-[18px] font-medium tracking-[0.15em] text-[#F5F5F5]">INDIA</span>
        </div>
        <p className="text-[#A1A1AA] font-light text-[13px] tracking-wide">Engineering Digital Products</p>
      </motion.div>

      {/* Kuwait */}
      <motion.div variants={fadeUp(TIMINGS.node2)} className="absolute left-[50%] top-[56.6%] -translate-x-1/2 flex flex-col items-center whitespace-nowrap text-center pt-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🇰🇼</span>
          <span className="text-[18px] font-medium tracking-[0.15em] text-[#F5F5F5]">KUWAIT</span>
        </div>
        <p className="text-[#A1A1AA] font-light text-[13px] tracking-wide">Business Automation</p>
      </motion.div>

      {/* Australia */}
      <motion.div variants={fadeUp(TIMINGS.node3)} className="absolute left-[50%] top-[81.6%] -translate-x-1/2 flex flex-col items-center whitespace-nowrap text-center pt-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🇦🇺</span>
          <span className="text-[18px] font-medium tracking-[0.15em] text-[#F5F5F5]">AUSTRALIA</span>
        </div>
        <p className="text-[#A1A1AA] font-light text-[13px] tracking-wide">Scalable SaaS Solutions</p>
      </motion.div>

      {/* Final Story Text */}
      <motion.div variants={fadeUp(TIMINGS.finalText)} className="absolute left-[50%] top-[91.6%] -translate-x-1/2 flex flex-col items-center whitespace-nowrap w-full">
        <p className="text-[15px] font-light tracking-[0.1em] text-[#F5F5F5] opacity-90 text-center">
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
        visible: { scale: 0.8, transition: { duration: 1.8, ease: APPLE_EASE } }
      }}
      className={`z-20 flex items-center justify-center ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Soft champagne gold glow */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1.25, transition: { duration: 2.5, delay: 0.5, ease: APPLE_EASE } }
          }}
          className="absolute inset-0 bg-[#C8A45C] blur-[40px] opacity-[0.22] rounded-full"
        />
        {/* Logo Image container */}
        <div className="relative z-10 w-[100px] h-[100px] rounded-full border border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden bg-[#050505]">
          <img src="/logo.jpeg" alt="DuoKarma" className="w-full h-full object-cover scale-[1.05]" />
        </div>
      </div>
    </motion.div>
  );
}
