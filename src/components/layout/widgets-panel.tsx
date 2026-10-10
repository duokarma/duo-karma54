import { useState, useEffect } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LiveClock,
  QuickActions,
  BusinessKPIs,
  PinnedProjects,
  UpcomingTasks,
  QuickNotes,
  ServerStatus,
} from "@/components/premium/widgets";

export function WidgetsPanel() {
  const [isOpen, setIsOpen] = useState(false);

  // Sync state outwards whenever isOpen changes
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("widgets-panel-state", { detail: { open: isOpen } })
    );
  }, [isOpen]);

  // Listen to toggle events from topbar or keyboard shortcuts
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);
    window.addEventListener("toggle-widgets-panel", handleToggle);
    window.addEventListener("close-widgets-panel", handleClose);
    return () => {
      window.removeEventListener("toggle-widgets-panel", handleToggle);
      window.removeEventListener("close-widgets-panel", handleClose);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Prevent background scrolling and lock scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Complete background blur overlay — gives 100% focus and attention to the sidebar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            aria-label="Click background to close"
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-2xl cursor-pointer"
          />

          {/* Widgets Panel */}
          <motion.aside
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-[120] flex w-88 max-w-[92vw] flex-col bg-[var(--color-void)] border-l border-[var(--color-edge)] shadow-2xl"
          >
            {/* Header with explicit, highly visible Close button */}
            <div className="flex items-center justify-between border-b border-[var(--color-edge)] px-4 py-3 bg-[var(--color-card)]/40 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/20 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink leading-none">Productivity Hub</h2>
                  <p className="text-[10px] text-ink-faint mt-0.5">Live Operations & Telemetry</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-7 px-2.5 gap-1.5 text-xs text-ink-faint hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 rounded-md transition-colors"
                title="Close Productivity Hub (Esc)"
              >
                <X className="h-3.5 w-3.5" />
                <span className="font-medium">Close</span>
                <kbd className="text-[9px] bg-white/5 border border-white/10 px-1 py-0.5 rounded text-ink-faint">Esc</kbd>
              </Button>
            </div>

            {/* Scrollable Widgets Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <LiveClock />
              <QuickActions onClose={handleClose} />
              <BusinessKPIs />
              <PinnedProjects onClose={handleClose} />
              <UpcomingTasks onClose={handleClose} />
              <QuickNotes />
              <ServerStatus />
            </div>

            {/* Footer with secondary close trigger */}
            <div className="border-t border-[var(--color-edge)] px-4 py-3 bg-[var(--color-card)]/40 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-ink-faint">DuoKarma Engine v2.4</span>
              </div>
              <button
                onClick={handleClose}
                className="text-[11px] font-medium text-ink-faint hover:text-rose-400 hover:bg-rose-500/10 px-2.5 py-1 rounded border border-white/10 hover:border-rose-500/30 transition-all flex items-center gap-1"
              >
                <XCircle className="h-3 w-3" />
                <span>Dismiss</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
