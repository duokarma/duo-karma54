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
            className="relative overflow-hidden flex items-center justify-center"
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
              preload="auto"
              onEnded={handleVideoEnd}
              className="w-full h-full object-cover"
              style={{ transform: 'scale(1.07)' }} // Slight zoom to crop out the watermark at the edge
            />
            {/* Fade overlays to blend the video edges into the #090B10 background seamlessly */}
            <div className="absolute inset-x-0 top-0 h-[10%] bg-gradient-to-b from-[#090B10] to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-[10%] bg-gradient-to-t from-[#090B10] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-[10%] bg-gradient-to-r from-[#090B10] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-[10%] bg-gradient-to-l from-[#090B10] to-transparent pointer-events-none" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}