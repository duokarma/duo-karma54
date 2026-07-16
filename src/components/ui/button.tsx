import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] shadow-sm",
        secondary:
          "bg-[var(--color-charcoal)] text-ink border border-[var(--color-edge)] hover:bg-[var(--color-charcoal-soft)] hover:border-[var(--color-edge-hover)]",
        ghost: "text-ink-faint hover:text-ink hover:bg-[var(--color-charcoal)]",
        outline: "border border-[var(--color-edge)] text-ink-dim hover:bg-[var(--color-charcoal)] hover:text-ink hover:border-[var(--color-edge-hover)]",
        destructive: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/25 hover:bg-[#EF4444]/20",
        link: "text-[#2563EB] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3.5 text-sm",
        sm: "h-7 px-2.5 text-xs",
        lg: "h-10 px-5 text-sm",
        icon: "h-8 w-8",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const MotionSlot = motion.create(Slot);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? MotionSlot : motion.button;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), "relative overflow-hidden")}
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...(props as any)}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
