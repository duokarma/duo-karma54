import { type Variants } from "framer-motion";

export const easings = {
  smooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
  bouncy: [0.68, -0.55, 0.26, 1.55] as [number, number, number, number],
  spring: "spring",
  easeOut: "easeOut",
};

export const springConfig = {
  stiff: { type: "spring", stiffness: 400, damping: 30 },
  bouncy: { type: "spring", stiffness: 300, damping: 15 },
  soft: { type: "spring", stiffness: 200, damping: 20 },
};

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: easings.smooth } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: easings.smooth } },
};

export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easings.smooth } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2, ease: easings.smooth } },
};

export const scaleUpVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: easings.smooth } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: easings.smooth } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
