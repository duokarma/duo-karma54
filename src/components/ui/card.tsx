import * as React from "react";
import { cn } from "@/lib/utils";
import { m as motion } from "framer-motion";
import { TiltCard, Spotlight, GlassReflection } from "@/components/premium";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <TiltCard maxTilt={3} className="h-full">
      <Spotlight className="h-full rounded-[var(--radius-card)]" color="rgba(255,255,255,0.03)">
        <motion.div
          ref={ref}
          className={cn(
            "bg-[var(--color-card)] border border-[var(--color-edge)] rounded-[var(--radius-card)] transition-colors h-full relative group overflow-hidden",
            className
          )}
          whileHover={{ y: -4, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.4)", borderColor: "var(--color-edge-hover)" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          {...props as any}
        >
          <GlassReflection />
          {children}
        </motion.div>
      </Spotlight>
    </TiltCard>
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1 px-4 pt-4 pb-3", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-sm font-medium text-ink-dim", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs text-ink-faint", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-4 pb-4 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center px-4 pb-4 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
