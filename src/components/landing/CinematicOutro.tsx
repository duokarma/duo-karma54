import { useRef } from 'react';
import { m as motion, useScroll, useTransform } from 'framer-motion';
import { COLORS } from './ui/theme';

export function CinematicOutro() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax mapping for the background to give natural depth
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section
      ref={containerRef}
      style={{
        position: 'relative',
        minHeight: '100vh', // Shorter than before for better UX
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Centered vertically
        alignItems: 'center', // Centered horizontally
        padding: '10vh 5%',
        background: '#010101',
        overflow: 'hidden',
      }}
    >
      {/* Background Image Layer */}
      <motion.div
        style={{
          position: 'absolute',
          inset: -150, // extend bounds significantly to allow for both scroll parallax and animated drift
          y,
        }}
      >
        <img
          src="/start.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
        />
      </motion.div>

      {/* Gradients and Overlays for depth and blending */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${COLORS.bg} 0%, rgba(10,9,8,0.2) 20%, rgba(10,9,8,0.2) 80%, ${COLORS.bg} 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Centered Glass CTA Panel */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-150px' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={{
            background: 'rgba(14, 13, 12, 0.65)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 24,
            padding: '64px 48px',
            maxWidth: 600,
            boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
            width: '100%',
            textAlign: 'center',
          }}
          className="dk-cta-card"
        >
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '0.15em', color: '#c9a876', textTransform: 'uppercase', marginBottom: 24 }}>
            Next Steps
          </div>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(32px, 5vw, 46px)',
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: 18,
              fontWeight: 400,
              letterSpacing: '-0.01em'
            }}
          >
            Great businesses deserve great digital experiences.
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(15px, 2vw, 16px)',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.6,
              marginBottom: 44,
            }}
          >
            Your digital presence shouldn't just exist. It should streamline operations, convert leads, and leave an unforgettable impression.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: '#fff',
              color: '#010101',
              border: 'none',
              padding: '16px 36px',
              borderRadius: 100,
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              transition: 'transform 0.4s ease',
            }}
          >
            Start Your Project <span style={{ fontSize: 18, transform: 'translateY(1px)' }}>→</span>
          </motion.button>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .dk-cta-card {
            padding: 40px 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
