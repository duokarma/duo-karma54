import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';

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
        minHeight: '160vh', // Creates a long, scrolling cinematic scene
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '15vh 6% 25vh 6%',
        background: '#010101',
        overflow: 'hidden',
      }}
    >
      {/* Background Video Layer */}
      <motion.div
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
          animate={{
            scale: [1, 1.04, 1],
            y: [0, -30, 0],
            x: [0, 10, 0]
          }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: 'linear'
          }}
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

      {/* Layer 5: Content */}

      {/* 1. Testimonials / Early Partners (Top Center) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 800, margin: '0 auto', paddingTop: '4vh' }}
      >
        <Eyebrow>
          <span style={{ color: 'rgba(201,168,118,0.9)' }}>Building with early partners</span>
        </Eyebrow>
        <p
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(24px, 3.2vw, 42px)',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.4,
            marginTop: 30,
            textShadow: '0 4px 24px rgba(0,0,0,0.5)'
          }}
        >
          We're still early — every current client is a founding partner. Testimonials will live here once the ink on real feedback is dry.
        </p>
      </motion.div>

      {/* 2. Glass CTA Panel (Bottom Right, Editorial Composition) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 10, marginTop: 'auto' }}>
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
            maxWidth: 540,
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
            width: '100%',
          }}
        >
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '0.15em', color: '#c9a876', textTransform: 'uppercase', marginBottom: 24 }}>
            Next Steps
          </div>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(32px, 3.8vw, 46px)',
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
              fontSize: 16,
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.6,
              marginBottom: 44,
            }}
          >
            Your website shouldn't just exist. It should sell, convert, and leave an unforgettable impression.
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
    </section>
  );
}
