import React, { useRef } from "react";
import { m as motion, useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion";

interface MagneticWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  strength?: number;
}

// Detect touch devices once at module level — no re-renders needed
const isTouchDevice =
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

export function MagneticWrapper({ children, strength = 0.2, ...props }: MagneticWrapperProps) {
  // On touch/mobile: just render children — no mouse listeners or motion values
  if (isTouchDevice) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  return <MagneticWrapperDesktop strength={strength} {...props}>{children}</MagneticWrapperDesktop>;
}

function MagneticWrapperDesktop({ children, strength = 0.2, ...props }: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * strength);
    y.set(middleY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
