import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border border-[var(--color-edge)] bg-[var(--color-charcoal)] text-ink-dim",
        success: "border border-[#10B981]/25 bg-[#10B981]/10 text-[#10B981]",
        warning: "border border-[#F59E0B]/25 bg-[#F59E0B]/10 text-[#F59E0B]",
        danger:  "border border-[#EF4444]/25 bg-[#EF4444]/10 text-[#EF4444]",
        info:    "border border-[#2563EB]/25 bg-[#2563EB]/10 text-[#2563EB]",
        violet:  "border border-[#7C3AED]/25 bg-[#7C3AED]/10 text-[#7C3AED]",
        cyan:    "border border-[#06B6D4]/25 bg-[#06B6D4]/10 text-[#06B6D4]",
        outline: "border border-[var(--color-edge)] text-ink-faint",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

import { m as motion } from "framer-motion";

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  const dotColors: Record<string, string> = {
    success: "#10B981",
    warning: "#F59E0B",
    danger:  "#EF4444",
    info:    "#2563EB",
    violet:  "#7C3AED",
    cyan:    "#06B6D4",
  };
  const dotColor = variant ? dotColors[variant] : undefined;

  return (
    <motion.span 
      className={cn(badgeVariants({ variant }), className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      {...(props as any)}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={dotColor ? { backgroundColor: dotColor } : { backgroundColor: "var(--color-ink-faint)" }}
        />
      )}
      {children}
    </motion.span>
  );
}

export { Badge, badgeVariants };
