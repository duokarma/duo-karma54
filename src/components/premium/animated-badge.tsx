import React from "react";
import { motion } from "framer-motion";
import { Badge, type BadgeProps } from "@/components/ui/badge";

interface AnimatedBadgeProps extends BadgeProps {
  children: React.ReactNode;
}

export function AnimatedBadge({ children, className, variant, ...props }: AnimatedBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="inline-block"
    >
      <Badge variant={variant} className={className} {...props}>
        {children}
      </Badge>
    </motion.div>
  );
}
