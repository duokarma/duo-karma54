import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-8 w-full rounded-[var(--radius-control)] border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint transition-colors",
          "focus-visible:outline-none focus-visible:border-[#2563EB]/60 focus-visible:ring-1 focus-visible:ring-[#2563EB]/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
