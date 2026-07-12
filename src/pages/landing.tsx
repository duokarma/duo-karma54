import { useState, useEffect, useRef } from 'react';
import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { About } from '@/components/landing/About';
import { WhatWeBuild } from '@/components/landing/WhatWeBuild';
import { Showcase } from '@/components/landing/Showcase';
import { Services } from '@/components/landing/Services';
import { Process } from '@/components/landing/Process';
import { TechStack } from '@/components/landing/TechStack';
import { Stats } from '@/components/landing/Stats';
import { EarlyPartners } from '@/components/landing/EarlyPartners';
import { CTA } from '@/components/landing/CTA';
import { Contact } from '@/components/landing/Contact';
import { Footer } from '@/components/landing/Footer';
import { Cursor } from '@/components/landing/ui/Cursor';
import { LoadingScreen } from '@/components/landing/ui/LoadingScreen';
import { COLORS, FONT_IMPORT } from '@/components/landing/ui/theme';
import { BottomDock } from '@/components/landing/BottomDock';
import { CommandPalette } from '@/components/landing/CommandPalette';

export function LandingPage() {
  const [ready, setReady] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mouseLight, setMouseLight] = useState({ x: -999, y: -999 });
  const lightRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1100);
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

  // Smooth mouse light tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lightRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);
    const tick = () => {
      setMouseLight((prev) => ({
        x: prev.x + (lightRef.current.x - prev.x) * 0.06,
        y: prev.y + (lightRef.current.y - prev.y) * 0.06,
      }));
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

      {/* Noise texture overlay — very subtle */}
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

      {/* Mouse light — champagne radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
          background: mouseLight.x > 0
            ? `radial-gradient(500px circle at ${mouseLight.x}px ${mouseLight.y}px, rgba(201,168,118,0.055) 0%, transparent 70%)`
            : 'none',
        }}
      />

      {/* ⌘K hint badge — bottom right, desktop only */}
      <button
        onClick={() => setCmdOpen(true)}
        aria-label="Open command palette"
        title="Press ⌘K or Ctrl+K"
        className="fixed bottom-8 right-6 z-[90] hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{
          background: 'rgba(10,9,8,0.7)',
          border: '1px solid rgba(201,168,118,0.18)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          cursor: 'pointer',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          color: COLORS.secondary,
          letterSpacing: '0.06em',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        ⌘K
      </button>

      <LoadingScreen done={ready} />
      <Cursor />
      <Nav />
      <BottomDock />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <Hero />
      <About />
      <WhatWeBuild />
      <Showcase />
      <Services />
      <Process />
      <TechStack />
      <Stats />
      <EarlyPartners />
      <CTA />
      <Contact />
      <Footer />
    </div>
  );
}
