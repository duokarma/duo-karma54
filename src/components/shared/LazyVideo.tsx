import { useEffect, useRef, useState } from 'react';

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src?: string;
  lowEndFallback?: boolean;
}

export function LazyVideo({ src, lowEndFallback = true, children, ...props }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    // Hardware-aware heuristics
    const cores = navigator.hardwareConcurrency || 4;
    // @ts-ignore - deviceMemory is non-standard but supported in Chromium
    const memory = navigator.deviceMemory || 4;
    
    if (cores < 4 || memory < 4) {
      setIsLowEnd(true);
    }
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (props.autoPlay && !(lowEndFallback && isLowEnd)) {
              // Defer playback until the main thread is idle
              const playVideo = () => {
                videoElement.play().catch(() => {});
              };
              
              if ('requestIdleCallback' in window) {
                window.requestIdleCallback(playVideo, { timeout: 2000 });
              } else {
                setTimeout(playVideo, 100);
              }
            }
          } else {
            videoElement.pause();
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '100px',
      }
    );

    observer.observe(videoElement);

    return () => {
      observer.disconnect();
    };
  }, [props.autoPlay, isLowEnd, lowEndFallback]);

  return (
    <video ref={videoRef} src={src} {...props}>
      {children}
      {/* 
        NOTE FOR USER: To enable AV1/WebM formats, remove the `src` prop and provide sources like this:
        <source src="/homepage.av1.mp4" type="video/mp4; codecs=av01.0.05M.08" />
        <source src="/homepage.webm" type="video/webm" />
        <source src="/homepage.mp4" type="video/mp4" />
      */}
    </video>
  );
}
