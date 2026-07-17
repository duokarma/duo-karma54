import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroVideo() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    if (!hasSeenIntro) {
      setShow(true);
    }
  }, []);

  const handleVideoEnd = () => {
    sessionStorage.setItem("hasSeenIntro", "true");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          <video
            src="/loading-video.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleVideoEnd}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
