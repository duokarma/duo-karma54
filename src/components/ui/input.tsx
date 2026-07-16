import * as React from "react";
import { cn } from "@/lib/utils";

import { Spotlight } from "@/components/premium";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <Spotlight className="rounded-[var(--radius-control)] w-full" color="rgba(37, 99, 235, 0.15)" size={150}>
        <input
          type={type}
          className={cn(
            "flex h-8 w-full rounded-[var(--radius-control)] border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint transition-all duration-300",
            "focus-visible:outline-none focus-visible:border-[var(--color-accent)] focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]/50 focus-visible:shadow-[0_0_15px_-3px_var(--color-accent)]",
            "disabled:cursor-not-allowed disabled:opacity-50 relative z-10 bg-transparent",
            className
          )}
          ref={ref}
          {...props}
        />
      </Spotlight>
    );
  }
);
Input.displayName = "Input";

export { Input };
