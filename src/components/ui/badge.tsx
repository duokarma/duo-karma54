import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-white/8 text-ink-dim border border-white/10",
        success: "bg-emerald/12 text-emerald border border-emerald/25",
        warning: "bg-amber/12 text-amber border border-amber/25",
        danger: "bg-rose/12 text-rose border border-rose/25",
        info: "bg-electric/12 text-electric border border-electric/25",
        violet: "bg-violet/12 text-violet border border-violet/25",
        cyan: "bg-cyan/12 text-cyan border border-cyan/25",
        outline: "border border-edge text-ink-dim",
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

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-emerald",
            variant === "warning" && "bg-amber",
            variant === "danger" && "bg-rose",
            variant === "info" && "bg-electric",
            variant === "violet" && "bg-violet",
            variant === "cyan" && "bg-cyan",
            (!variant || variant === "default" || variant === "outline") && "bg-ink-dim"
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
