import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeVariants } from "@/lib/motion";
import React from "react";

interface AnimatedPageProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export const AnimatedPage = React.forwardRef<HTMLDivElement, AnimatedPageProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
AnimatedPage.displayName = "AnimatedPage";
