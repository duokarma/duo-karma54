import { useRef } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from './ui/theme';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4';

export function CTA() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: 520,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: '#050504',
      }}
    >
      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 60%',
          opacity: 0.45,
        }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Rich dark overlay — heavier at top/bottom edges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.75) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 2, padding: '100px 5%' }}
      >
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: 'clamp(32px, 5.5vw, 68px)',
            color: '#fff',
            marginBottom: 14,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}
        >
          Ready to modernize
          <br />
          your business?
        </h2>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(14px, 1.3vw, 17px)',
            color: 'rgba(255,255,255,0.55)',
            marginBottom: 44,
            letterSpacing: '0.02em',
          }}
        >
          Let's build something lasting together.
        </p>

        {/* Liquid glass button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          onClick={() => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.9)',
            padding: '14px 40px',
            borderRadius: 9999,
            border: 'none',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow:
              'inset 0 1px 1px rgba(255,255,255,0.15), 0 0 0 1.2px rgba(255,255,255,0.12)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          Book free consultation
        </motion.button>
      </motion.div>

      {/* Bottom fade to footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: `linear-gradient(to bottom, transparent, ${COLORS.bg})`,
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />
    </section>
  );
}