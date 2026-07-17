import { m as motion, useScroll } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-[var(--color-electric)] origin-left z-50 shadow-[0_0_10px_var(--color-electric)]"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
