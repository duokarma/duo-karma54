import React, { useEffect, useRef } from 'react';
import { AnimatedTextReveal } from './ui/AnimatedTextReveal';
import { MagneticWrapper } from '@/components/premium/magnetic-wrapper';

export const Hero = React.memo(function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Explicitly enforce muted state (required for Safari autoplay policies)
    // React sometimes doesn't sync the muted property to the DOM node correctly.
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      
      // Force play to ensure playback continues even if browser attempts to suspend
      // the video while the loader overlay is present.
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <section className="relative w-full overflow-hidden bg-black" style={{ height: '100dvh' }}>
        
        {/* Layer 1: Background Video (Zooming out on load) */}
        <div className="absolute inset-0 z-10 hero-zoom bg-black">
          <video 
            ref={videoRef}
            src="/homepage.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-50"
            style={{ filter: 'contrast(1.1) brightness(0.9)' }}
          />
          {/* Simple, clean gradients to blend edges without obscuring the main video */}
          <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-[#010101] to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </div>
        
        {/* Layer 1.5: Grid Pattern removed */}
        {/* Layer 3: Heading */}
        <h1 className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50 text-white leading-[0.95] tracking-tight">
          <AnimatedTextReveal 
            text="We build software" 
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl" 
            delayOffset={0.25} 
          />
          <AnimatedTextReveal 
            text="businesses actually use" 
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1" 
            delayOffset={0.7} 
          />
        </h1>

        {/* Layer 4: Bottom-left paragraph */}
        <div className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade" style={{ animationDelay: '0.7s' }}>
          <p className="text-sm text-white/80 leading-relaxed">
            We partner with visionary brands to build robust, scalable digital solutions that transform complex challenges into your competitive advantage.
          </p>
        </div>

        {/* Layer 5: Bottom-right block */}
        <div className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade" style={{ animationDelay: '0.85s' }}>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            We engineer scalable, intuitive platforms that transform complex operations into streamlined workflows. Discover how intelligent automation and purposeful design drive measurable business growth.
          </p>
          <MagneticWrapper>
            <button 
              className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30 relative overflow-hidden group"
              onClick={() => {
                document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="relative z-10">Start Building</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
          </MagneticWrapper>
        </div>
      </section>
    </div>
  );
});
