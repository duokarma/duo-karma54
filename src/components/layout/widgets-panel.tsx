import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveClock, QuickNotes, ServerStatus, PinnedProjects } from "@/components/premium/widgets";

export function WidgetsPanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-widgets-panel", handleToggle);
    return () => window.removeEventListener("toggle-widgets-panel", handleToggle);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm lg:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-[120] flex w-80 flex-col bg-[var(--color-void)] border-l border-[var(--color-edge)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-edge)] p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-medium text-ink">Productivity</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 text-ink-faint hover:text-ink"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Scrollable Widgets Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <LiveClock />
              <QuickNotes />
              <PinnedProjects />
              <ServerStatus />
            </div>
            
            {/* Footer */}
            <div className="border-t border-[var(--color-edge)] p-3 text-center">
              <p className="text-[10px] text-ink-faint">DuoKarma Widgets Engine v1.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
