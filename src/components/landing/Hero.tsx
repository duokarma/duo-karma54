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
            disablePictureInPicture
            className="absolute inset-0 w-full h-full object-cover object-center opacity-50 pointer-events-none"
            style={{ filter: 'contrast(1.1) brightness(0.9)' }}
          />
          {/* Simple, clean gradients to blend edges without obscuring the main video */}
          <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-[#010101] to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </div>
        
        {/* Layer 1.5: Grid Pattern removed */}
        {/* Layer 3: Heading */}
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

        {/* Layer 4: Bottom-left paragraph */}
        <div className="hidden md:block absolute bottom-14 left-14 max-w-[320px] z-50 hero-anim hero-fade" style={{ animationDelay: '0.7s' }}>
          <p className="text-[15px] text-white/70 leading-loose font-light">
            We partner with visionary brands to build robust, scalable digital solutions that transform complex challenges into your competitive advantage.
          </p>
        </div>

        {/* Layer 5: Bottom-right block */}
        <div className="absolute bottom-10 sm:bottom-14 left-6 right-6 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[340px] flex flex-col items-start sm:items-end sm:text-right gap-5 z-50 hero-anim hero-fade" style={{ animationDelay: '0.85s' }}>
          <p className="text-[14px] sm:text-[15px] text-white/70 leading-loose font-light">
            We engineer scalable, intuitive platforms that transform complex operations into streamlined workflows. Discover how intelligent automation drives measurable business growth.
          </p>
          <MagneticWrapper>
            <button 
              className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-8 py-3.5 rounded-full transition-all duration-500 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-[#e8702a]/20 relative overflow-hidden group"
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
