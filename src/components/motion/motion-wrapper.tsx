import { m as motion, type HTMLMotionProps } from "framer-motion";
import { fadeVariants } from "@/lib/motion";
import React from "react";

interface MotionWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variants?: any;
}

export const MotionWrapper = React.forwardRef<HTMLDivElement, MotionWrapperProps>(
  ({ children, variants = fadeVariants, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={variants}
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
MotionWrapper.displayName = "MotionWrapper";
