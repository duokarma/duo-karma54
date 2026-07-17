import { m as motion, type HTMLMotionProps } from "framer-motion";
import { staggerContainer, slideUpVariants } from "@/lib/motion";
import React from "react";

interface AnimatedListProps extends HTMLMotionProps<"ul"> {
  children: React.ReactNode;
}

export const AnimatedList = React.forwardRef<HTMLUListElement, AnimatedListProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.ul
        ref={ref}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        exit="exit"
        {...props}
      >
        {children}
      </motion.ul>
    );
  }
);
AnimatedList.displayName = "AnimatedList";

interface AnimatedListItemProps extends HTMLMotionProps<"li"> {
  children: React.ReactNode;
}

export const AnimatedListItem = React.forwardRef<HTMLLIElement, AnimatedListItemProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.li
        ref={ref}
        variants={slideUpVariants}
        {...props}
      >
        {children}
      </motion.li>
    );
  }
);
AnimatedListItem.displayName = "AnimatedListItem";
