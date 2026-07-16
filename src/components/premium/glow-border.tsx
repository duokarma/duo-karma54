import React from "react";
import { cn } from "@/lib/utils";

interface GlowBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  color?: string;
}

export function GlowBorder({ children, className, color = "var(--color-accent)", ...props }: GlowBorderProps) {
  return (
    <div className={cn("relative group rounded-xl p-[1px]", className)} {...props}>
      <div 
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-transparent group-hover:via-[var(--color-accent)] group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
        style={{ '--color-accent': color } as React.CSSProperties}
      />
      {/* Animated spinning border effect via CSS or simple gradient sweep */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-all duration-700 bg-[length:200%_100%]" style={{ '--color-accent': color } as React.CSSProperties} />
      <div className="relative h-full w-full rounded-xl bg-[var(--color-card)] overflow-hidden">
        {children}
      </div>
    </div>
  );
}
