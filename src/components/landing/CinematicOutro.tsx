import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { COLORS } from './ui/theme';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4';

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
      {/* Background Video Layer */}
      <motion.div
        className="dk-video-mask"
        style={{
          position: 'absolute',
          inset: -150, // extend bounds significantly to allow for both scroll parallax and animated drift
          y,
        }}
      >
        <motion.video
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.7, 
          }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </motion.video>
      </motion.div>

      {/* Gradients and Overlays for depth and blending */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${COLORS.bg} 0%, rgba(10,9,8,0.3) 15%, rgba(10,9,8,0.35) 75%, ${COLORS.bg} 100%)`,
          pointerEvents: 'none',
        }}
      />
      
      {/* Additional vignette to frame the content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(0,0,0,0.45) 100%)',
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
            background: 'rgba(14, 13, 12, 0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(201,168,118,0.2)',
            borderRadius: 24,
            padding: '56px 48px',
            maxWidth: 600,
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
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
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: 'linear-gradient(180deg, rgba(201,168,118,0.15) 0%, rgba(201,168,118,0.05) 100%)',
              border: '1px solid rgba(201,168,118,0.4)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.2)',
              color: '#fff',
              padding: '15px 32px',
              borderRadius: 100,
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              transition: 'border-color 0.3s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(201,168,118,0.7)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(201,168,118,0.4)'}
          >
            Start Your Project <span style={{ fontSize: 18, color: '#c9a876', transform: 'translateY(1px)' }}>→</span>
          </motion.button>
        </motion.div>
      </div>

      <style>{`
        .dk-video-mask {
          -webkit-mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black 40%, transparent 100%);
          mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black 40%, transparent 100%);
        }
        @media (max-width: 640px) {
          .dk-cta-card {
            padding: 40px 24px !important;
          }
          .dk-video-mask {
            -webkit-mask-image: radial-gradient(ellipse 80% 40% at 50% 50%, black 20%, transparent 100%);
            mask-image: radial-gradient(ellipse 80% 40% at 50% 50%, black 20%, transparent 100%);
          }
        }
      `}</style>
    </section>
  );
}
