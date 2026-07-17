import { m as motion, type HTMLMotionProps } from "framer-motion";
import { slideUpVariants } from "@/lib/motion";
import React from "react";

interface AnimatedSectionProps extends HTMLMotionProps<"section"> {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedSection = React.forwardRef<HTMLElement, AnimatedSectionProps>(
  ({ children, delay = 0, ...props }, ref) => {
    return (
      <motion.section
        ref={ref}
        variants={slideUpVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay }}
        {...props}
      >
        {children}
      </motion.section>
    );
  }
);
AnimatedSection.displayName = "AnimatedSection";
