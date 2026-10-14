import React from 'react';
import { AnimatedTextReveal } from './ui/AnimatedTextReveal';
import { MagneticWrapper } from '@/components/premium/magnetic-wrapper';
import { HeroBackground } from './HeroBackground';

// Detect touch/mobile devices — used to skip heavy effects
const isTouchDevice =
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

export const Hero = React.memo(function Hero() {
  return (
    <div className="tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <section className="relative w-full overflow-hidden bg-black" style={{ height: '100dvh' }}>

        {/* Layer 0+1: New LŪMEN-style decorative background (video + grid + nodes) */}
        <HeroBackground />

        {/* Layer 3: Heading — UNCHANGED content, z-50 to sit above background */}
        <h1 className="absolute top-[15%] sm:top-[20%] left-6 sm:left-10 md:left-14 right-6 sm:right-auto flex flex-col items-start text-left pointer-events-none z-50 text-white leading-[1.05] tracking-tight">
          <AnimatedTextReveal
            text="We build software"
            className="block font-sans font-semibold text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem]"
            delayOffset={0.25}
          />
          <AnimatedTextReveal
            text="businesses actually use."
            className="block font-sans font-light text-3xl sm:text-5xl md:text-6xl lg:text-[4.5rem] mt-2 sm:mt-3 text-white/80"
            delayOffset={0.7}
          />
        </h1>

        {/* Layer 4: Bottom-left paragraph — UNCHANGED */}
        <div className="hidden md:block absolute bottom-14 left-14 max-w-[320px] z-50 hero-anim hero-fade" style={{ animationDelay: '0.7s' }}>
          <p className="text-[15px] text-white/70 leading-loose font-light">
            We partner with visionary brands to build robust, scalable digital solutions that transform complex challenges into your competitive advantage.
          </p>
        </div>

        {/* Layer 5: Bottom-right block — content unchanged, CTA re-themed to ice-blue */}
        <div className="absolute bottom-10 sm:bottom-14 left-6 right-6 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[340px] flex flex-col items-start sm:items-end sm:text-right gap-5 z-50 hero-anim hero-fade" style={{ animationDelay: '0.85s' }}>
          <p className="text-[14px] sm:text-[15px] text-white/70 leading-loose font-light">
            We engineer scalable, intuitive platforms that transform complex operations into streamlined workflows. Discover how intelligent automation drives measurable business growth.
          </p>
          {isTouchDevice ? (
            // On mobile: plain button — no mouse-tracking needed
            <button
              className="bg-[#AFDDFF] hover:bg-[#c8e8ff] text-black text-sm font-medium px-8 py-3.5 rounded-full transition-all duration-500 ease-out active:scale-[0.98]"
              onClick={() => {
                document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Start Building
            </button>
          ) : (
            <MagneticWrapper>
              <button
                className="bg-[#AFDDFF] hover:bg-[#c8e8ff] text-black text-sm font-medium px-8 py-3.5 rounded-full transition-all duration-500 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-[#AFDDFF]/20 relative overflow-hidden group"
                onClick={() => {
                  document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="relative z-10">Start Building</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            </MagneticWrapper>
          )}
        </div>
      </section>
    </div>
  );
});
