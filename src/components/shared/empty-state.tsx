import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { m as motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => setMousePosition({ x: 0, y: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex flex-col items-center justify-center gap-3 py-16 text-center"
    >
      <motion.div 
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-[var(--color-edge)] shadow-[var(--shadow-card)]"
        whileHover={{ scale: 1.1, rotate: 5, backgroundColor: "rgba(255,255,255,0.08)" }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <div className="absolute inset-0 bg-[var(--color-accent)] blur-[20px] opacity-20 rounded-2xl" />
        <Icon className="h-6 w-6 text-ink-faint relative z-10" />
      </motion.div>
      <div>
        <p className="font-display text-sm font-medium text-ink">{title}</p>
        <p className="mt-1 max-w-sm text-xs text-ink-faint">{description}</p>
      </div>
      {actionLabel && onAction && (
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{ x: mousePosition.x * 0.2, y: mousePosition.y * 0.2 }}
          transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
          className="mt-4 inline-block p-4 -m-4" // Padding increases the hover area for the magnetic effect
        >
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
