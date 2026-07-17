import { useEffect, useRef } from 'react';

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

export function LazyVideo({ src, ...props }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (props.autoPlay) {
              videoElement.play().catch(() => {});
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
  }, [props.autoPlay]);

  return <video ref={videoRef} src={src} {...props} />;
}
