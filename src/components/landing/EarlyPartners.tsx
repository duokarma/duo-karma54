import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Eyebrow } from './ui/Eyebrow';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4';

export function EarlyPartners() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        margin: '0 5%',
        borderRadius: 28,
        minHeight: 420,
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
          objectPosition: 'center',
          opacity: 0.55,
        }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Dark gradient overlay for legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.72) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '80px 5%',
          maxWidth: 680,
        }}
      >
        <Eyebrow>
          <span style={{ color: 'rgba(201,168,118,0.9)', margin: '0 auto' }}>
            Building with early partners
          </span>
        </Eyebrow>

        <p
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(18px, 2.2vw, 26px)',
            color: 'rgba(255,255,255,0.88)',
            lineHeight: 1.6,
            margin: '0 auto',
            maxWidth: 560,
          }}
        >
          We're still early — every current client is a founding partner.
          Testimonials will live here once the ink on real feedback is dry.
        </p>
      </motion.div>
    </section>
  );
}