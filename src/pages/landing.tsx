import { useState, useEffect } from 'react';
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

export function LandingPage() {
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <style>{FONT_IMPORT}</style>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::selection { background: ${COLORS.accent}; color: ${COLORS.bg}; }
        @media (hover: none) {
          .dk-cursor { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
      <LoadingScreen done={ready} />
      <Cursor />
      <Nav />
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
