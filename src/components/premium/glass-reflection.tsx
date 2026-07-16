import React from "react";
import { cn } from "@/lib/utils";

interface GlassReflectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function GlassReflection({ children, className, ...props }: GlassReflectionProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none rounded-inherit z-10", className)} {...props}>
      <div className="absolute top-0 left-[-100%] h-full w-[50%] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out" />
      {children}
    </div>
  );
}
