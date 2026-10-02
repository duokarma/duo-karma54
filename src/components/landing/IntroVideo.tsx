import React, { useRef, useEffect, useState } from 'react';

interface IntroVideoProps {
  /** Called when the video finishes playing */
  onEnded: () => void;
  /** Optional poster image path */
  poster?: string;
}

/**
 * Reusable responsive intro video component.
 *
 * - Serves mobile sources (<768 px) vs desktop sources (≥768 px)
 * - Source order: WebM first (smaller, faster), MP4 fallback
 * - autoPlay · muted · playsInline · no controls · no loop
 * - GPU-accelerated via will-change + translateZ(0)
 * - Fades in once the browser has loaded enough data to play
 * - Calls onEnded when the video finishes (or on unrecoverable error)
 */
export const IntroVideo = React.memo(function IntroVideo({
  onEnded,
  poster,
}: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [canPlay, setCanPlay] = useState(false);

  // Track viewport breakpoint reactively
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Force muted (Safari workaround) and kick off play
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.defaultMuted = true;
    el.muted = true;
    el.play().catch(() => {
      // Autoplay blocked — treat as ended so site isn't stuck
      onEnded();
    });
  }, [onEnded]);

  const prefix = isMobile ? '/videos/intro-mobile' : '/videos/intro-desktop';

  return (
    <video
      ref={videoRef}
      key={prefix} // remount if breakpoint changes
      autoPlay
      muted
      playsInline
      preload="auto"
      poster={poster}
      onCanPlayThrough={() => setCanPlay(true)}
      onEnded={onEnded}
      onError={onEnded}
      className="absolute inset-0 w-full h-full object-cover"
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        opacity: canPlay ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* WebM first for Chrome/Firefox/Edge — best compression */}
      <source src={`${prefix}.webm`} type="video/webm" />
      {/* MP4 fallback for Safari and older browsers */}
      <source src={`${prefix}.mp4`} type="video/mp4" />
    </video>
  );
});
