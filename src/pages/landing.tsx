import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { Cursor } from '@/components/landing/ui/Cursor';
import { LoadingScreen } from '@/components/landing/ui/LoadingScreen';
import { COLORS, FONT_IMPORT } from '@/components/landing/ui/theme';
import { BottomDock } from '@/components/landing/BottomDock';
import { CommandPalette } from '@/components/landing/CommandPalette';

// Lazy load below-the-fold components
const About = React.lazy(() => import('@/components/landing/About').then(m => ({ default: m.About })));
const WhatWeBuild = React.lazy(() => import('@/components/landing/WhatWeBuild').then(m => ({ default: m.WhatWeBuild })));
const Showcase = React.lazy(() => import('@/components/landing/Showcase').then(m => ({ default: m.Showcase })));
const Services = React.lazy(() => import('@/components/landing/Services').then(m => ({ default: m.Services })));
const Process = React.lazy(() => import('@/components/landing/Process').then(m => ({ default: m.Process })));
const Stats = React.lazy(() => import('@/components/landing/Stats').then(m => ({ default: m.Stats })));
const CinematicOutro = React.lazy(() => import('@/components/landing/CinematicOutro').then(m => ({ default: m.CinematicOutro })));
const Contact = React.lazy(() => import('@/components/landing/Contact').then(m => ({ default: m.Contact })));
const Footer = React.lazy(() => import('@/components/landing/Footer').then(m => ({ default: m.Footer })));
const AmbientEffects = React.lazy(() => import('@/components/premium/ambient-effects').then(m => ({ 
  default: () => (
    <>
      <m.SoftAurora />
      <m.FloatingParticles />
      <m.AnimatedNoise />
    </>
  )
})));

export function LandingPage() {
  const [ready, setReady] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  
  // Use a ref for the glow element to bypass React rendering at 60fps
  const glowRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Safety fallback
    const t = setTimeout(() => setReady(true), 8000);
    return () => clearTimeout(t);
  }, []);

  // ⌘K / Ctrl+K listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Smooth mouse light tracking using direct DOM mutation (Zero React Renders!)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lightRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);
    
    const tick = () => {
      const target = lightRef.current;
      const smooth = smoothRef.current;
      const glowEl = glowRef.current;
      
      if (glowEl && target.x !== -999) {
        if (smooth.x === -999) {
          smooth.x = target.x;
          smooth.y = target.y;
        } else {
          const dx = target.x - smooth.x;
          const dy = target.y - smooth.y;
          smooth.x += dx * 0.06;
          smooth.y += dy * 0.06;
        }
        
        glowEl.style.background = `radial-gradient(500px circle at ${smooth.x}px ${smooth.y}px, rgba(201,168,118,0.055) 0%, transparent 70%)`;
      }
      
      rafRef.current = requestAnimationFrame(tick);
    };
    
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style>{FONT_IMPORT}</style>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::selection { background: ${COLORS.accent}; color: ${COLORS.bg}; }
        @media (hover: none) { .dk-cursor { display: none; } }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Defer ambient effects until ready to prevent blocking the hero video/loading */}
      {ready && (
        <Suspense fallback={null}>
          <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
            <AmbientEffects />
          </div>
        </Suspense>
      )}

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

      {/* Mouse light — mutated directly via ref */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      <LoadingScreen done={ready} />
      <Cursor />
      <Nav />
      <BottomDock />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <Hero ready={ready} />
      
      {/* Lazy loaded sections */}
      <Suspense fallback={<div className="h-[200px]" />}>
        <About />
        <WhatWeBuild />
        <Showcase />
        <Services />
        <Process />
        <Stats />
        <CinematicOutro />
        <Contact />
        <Footer />
      </Suspense>
    </div>
  );
}
