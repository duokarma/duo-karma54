import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export function LoadingScreen({ done }: { done: boolean }) {
  const [shouldHide, setShouldHide] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (done) setShouldHide(true);
  }, [done]);

  const handleVideoEnd = () => {
    setShouldHide(true);
  };

  return (
    <AnimatePresence>
      {!shouldHide && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-[#090B10] flex items-center justify-center overflow-hidden"
        >
          {/* Constrain container to exactly 16:9 while fitting within screen bounds */}
          <div 
            className="relative overflow-hidden"
            style={{
              width: '100%',
              height: '100%',
              maxWidth: 'calc(100vh * (16 / 9))',
              maxHeight: 'calc(100vw * (9 / 16))',
            }}
          >
            <video
              ref={videoRef}
              src="/loading-video.mp4"
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnd}
              className="w-full h-full object-cover"
              style={{ transform: 'scale(1.07)' }} // Slight zoom to crop out the watermark at the edge
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}