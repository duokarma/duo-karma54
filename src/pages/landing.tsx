import React, { useState, useEffect, Suspense } from 'react';
import { useMotionValue, useSpring, useMotionTemplate, motion } from 'framer-motion';
import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { LoadingScreen } from '@/components/landing/ui/LoadingScreen';
import { COLORS } from '@/components/landing/ui/theme';
import { BottomDock } from '@/components/landing/BottomDock';
import { IntroProvider } from '@/context/IntroContext';
import { useIntro } from '@/hooks/use-intro';

// Detect touch/mobile devices — module-level, no re-renders
const isTouchDevice =
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

// Lazy-load the cursor (desktop-only premium effect)
const Cursor = !isTouchDevice
  ? React.lazy(() =>
      import('@/components/landing/ui/Cursor').then((m) => ({ default: m.Cursor }))
    )
  : null;

// Lazy load below-the-fold components — each in its own Suspense boundary
const About = React.lazy(() => import('@/components/landing/About').then((m) => ({ default: m.About })));
const WhatWeBuild = React.lazy(() => import('@/components/landing/WhatWeBuild').then((m) => ({ default: m.WhatWeBuild })));
const MagazineSection = React.lazy(() => import('@/components/landing/MagazineSection').then((m) => ({ default: m.MagazineSection })));
const Services = React.lazy(() => import('@/components/landing/Services').then((m) => ({ default: m.Services })));
const PraiseMarquee = React.lazy(() => import('@/components/landing/PraiseMarquee').then((m) => ({ default: m.PraiseMarquee })));
const GlobalPresence = React.lazy(() => import('@/components/landing/GlobalPresence').then((m) => ({ default: m.GlobalPresence })));
const Process = React.lazy(() => import('@/components/landing/Process').then((m) => ({ default: m.Process })));
const Stats = React.lazy(() => import('@/components/landing/Stats').then((m) => ({ default: m.Stats })));
const Contact = React.lazy(() => import('@/components/landing/Contact').then((m) => ({ default: m.Contact })));
const Footer = React.lazy(() => import('@/components/landing/Footer').then((m) => ({ default: m.Footer })));

// CommandPalette is keyboard-only — defer mount until first Ctrl+K
const CommandPalette = React.lazy(() =>
  import('@/components/landing/CommandPalette').then((m) => ({ default: m.CommandPalette }))
);

/** Minimal skeleton shown while each section loads */
function SectionSkeleton({ height = 200 }: { height?: number }) {
  return <div style={{ height }} aria-hidden="true" />;
}

// Inner component that consumes intro context for the fade-in effect
function LandingPageInner() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdMounted, setCmdMounted] = useState(false);

  // ── Mouse-light tracking — only on desktop ──────────────────────────────────
  // Using useMotionValue + useSpring instead of useState+rAF eliminates full
  // React re-renders on every animation frame. The gradient <motion.div> reads
  // the motion values directly — zero React re-renders while the cursor moves.
  const rawX = useMotionValue(-999);
  const rawY = useMotionValue(-999);
  const smoothX = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.5 });
  const smoothY = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.5 });

  // Builds the gradient string reactively from motion values — no setState needed
  const background = useMotionTemplate`radial-gradient(500px circle at ${smoothX}px ${smoothY}px, rgba(175,221,255,0.055) 0%, transparent 70%)`;

  useEffect(() => {
    if (isTouchDevice) return; // Skip on mobile — no mouse to track
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [rawX, rawY]);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // ⌘K / Ctrl+K — mount CommandPalette on first use
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdMounted(true);
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { introDone } = useIntro();

  return (
    <main
      style={{
        background: COLORS.bg,
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden',
        opacity: introDone ? 1 : 0,
        filter: introDone ? 'blur(0px)' : 'blur(4px)',
        transition: isTouchDevice
          ? 'opacity 0.15s ease, filter 0.15s ease'
          : 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), filter 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::selection { background: ${COLORS.accent}; color: ${COLORS.bg}; }
        @media (hover: none) { .dk-cursor { display: none; } }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Noise texture overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px',
          opacity: 0.028,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Soft page vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, transparent 50%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      {/* Mouse light — desktop only, zero re-renders via motion values */}
      {!isTouchDevice && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2,
            background,
          }}
        />
      )}

      {/* Cursor — desktop only, lazy-loaded */}
      {Cursor && (
        <Suspense fallback={null}>
          <Cursor />
        </Suspense>
      )}

      <Nav />
      <BottomDock />

      {/* CommandPalette — mounted lazily on first Ctrl+K */}
      {cmdMounted && (
        <Suspense fallback={null}>
          <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
        </Suspense>
      )}

      <Hero />

      {/* Each section in its own Suspense so one slow section never blocks the rest */}
      <Suspense fallback={<SectionSkeleton height={300} />}>
        <About />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={400} />}>
        <WhatWeBuild />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={600} />}>
        <MagazineSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={400} />}>
        <Services />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={250} />}>
        <PraiseMarquee />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={500} />}>
        <GlobalPresence />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={400} />}>
        <Process />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={300} />}>
        <Stats />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={500} />}>
        <Contact />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={100} />}>
        <Footer />
      </Suspense>
    </main>
  );
}

export function LandingPage() {
  return (
    <IntroProvider>
      <LoadingScreen />
      <LandingPageInner />
    </IntroProvider>
  );
}
