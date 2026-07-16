import * as React from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

const variantConfig: Record<ToastVariant, { icon: React.ComponentType<{ className?: string }>; className: string }> = {
  success: { icon: CheckCircle2, className: "text-emerald" },
  error: { icon: XCircle, className: "text-rose" },
  info: { icon: Info, className: "text-electric" },
};

const VISIBLE_TOASTS_AMOUNT = 3;

function ToastCard({
  t,
  index,
  total,
  onDismiss,
}: {
  t: ToastItem;
  index: number;
  total: number;
  onDismiss: (id: string) => void;
}) {
  const config = variantConfig[t.variant];
  const Icon = config.icon;
  const isFront = index === 0;

  // For stacked effect
  const offset = index * 12; // Each one goes 12px higher
  const scale = 1 - index * 0.05; // Each one shrinks by 5%
  const opacity = index < VISIBLE_TOASTS_AMOUNT ? 1 - index * 0.2 : 0; // Fade out older ones

  // Swipe logic
  const x = useMotionValue(0);
  const swipeOpacity = useTransform(x, [-100, 0, 100], [0, 1, 0]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(t.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [t.id, onDismiss]);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{
        opacity,
        y: -offset,
        scale,
        zIndex: total - index,
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        x,
        opacity: swipeOpacity as any, // framer-motion typing issue with combined opacities
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_e, { offset, velocity }) => {
        if (Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500) {
          onDismiss(t.id);
        }
      }}
      className={cn(
        "flex w-80 items-start gap-3 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-panel)]",
        "glass-panel-strong border border-[var(--color-edge)]",
        !isFront && "pointer-events-none"
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.className)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{t.title}</p>
        {t.description && (
          <p className="mt-0.5 text-xs text-ink-faint leading-snug">{t.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(t.id)}
        className="text-ink-faint hover:text-ink transition-colors mt-0.5"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress Indicator */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-[var(--color-accent)] rounded-b-[var(--radius-card)]"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
      />
    </motion.li>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    // Add new toasts to the front of the array
    setToasts((prev) => [{ ...t, id }, ...prev]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] w-80 h-32 pointer-events-none flex items-end justify-end">
        <ul className="relative w-full h-full pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {toasts.map((t, i) => (
              <ToastCard
                key={t.id}
                t={t}
                index={i}
                total={toasts.length}
                onDismiss={dismiss}
              />
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
