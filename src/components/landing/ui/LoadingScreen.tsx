import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

export function LoadingScreen({ done }: { done: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);

  // When the video ends OR the parent says done, begin fade-out
  useEffect(() => {
    if (done || videoEnded) {
      // Small delay so the fade-out animation is visible
      const t = setTimeout(() => setShouldHide(true), 300);
      return () => clearTimeout(t);
    }
  }, [done, videoEnded]);

  // Attempt autoplay on mount
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.play().catch(() => {
        // If autoplay is blocked, skip the video
        setVideoEnded(true);
      });
    }
  }, []);

  return (
    <AnimatePresence>
      {!shouldHide && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999] bg-black"
        >
          <video
            ref={videoRef}
            src="/loading-video.mp4"
            muted
            playsInline
            onEnded={() => setVideoEnded(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}