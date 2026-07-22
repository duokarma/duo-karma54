import { m as motion } from "framer-motion";
import { CreditCard, FolderKanban, Target, FileText, Users, CheckSquare, Pin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Activity } from "@/types";

const typeIcon: Record<string, typeof CreditCard> = {
  payment: CreditCard,
  project: FolderKanban,
  lead:    Target,
  invoice: FileText,
  client:  Users,
  task:    CheckSquare,
};

const typeIconColor: Record<string, string> = {
  payment: "text-[#10B981]",
  project: "text-[#2563EB]",
  lead:    "text-[#F59E0B]",
  invoice: "text-[#6366F1]",
  client:  "text-[#06B6D4]",
  task:    "text-ink-faint",
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activities").select("*").order("timestamp", { ascending: false }).limit(10);
      if (error) throw error;
      return data as Activity[];
    },
  });

  const totalNotificationsCount = activities.length + 1; // including pinned Ten11 notification

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-9 z-50 w-80 rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] shadow-[var(--shadow-dropdown)] overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-[var(--color-edge)] px-4 py-3">
        <p className="text-sm font-medium text-ink">Notifications</p>
        <span className="rounded-md border border-[#2563EB]/25 bg-[#2563EB]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#2563EB]">
          {totalNotificationsCount} new
        </span>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {/* Pinned Notification for Ten11 */}
        <div className="border-b border-[var(--color-edge)] bg-amber-500/5 px-4 py-3 text-left transition-colors hover:bg-amber-500/10">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-500">
              <Pin className="h-3.5 w-3.5 fill-amber-500/20" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-xs font-semibold text-ink">Ten11 — Yearly Maintenance Fee</span>
                <span className="rounded border border-amber-500/30 bg-amber-500/15 px-1 py-0.2 text-[9px] font-semibold text-amber-500 uppercase tracking-wider">
                  PINNED
                </span>
              </div>
              <p className="text-xs text-ink-dim leading-snug">
                Friendly reminder: Ten11 has a yearly maintenance fee of ₹4,000 pending and should be paid before July.
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-amber-500/90">Admin Notice</span>
                <span className="text-[10px] text-ink-faint">·</span>
                <span className="text-[10px] text-ink-faint">Persistent until cleared</span>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-sm text-ink-dim">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="p-4 text-center text-sm text-ink-dim">No other notifications</div>
        ) : (
          activities.map((activity) => {
            const Icon = typeIcon[activity.type] || CheckSquare;
            return (
              <button
                key={activity.id}
                onClick={onClose}
                className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--color-charcoal)] border-b border-[var(--color-edge)]/40 last:border-0"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--color-edge)] bg-[var(--color-void)]">
                  <Icon className={`h-3.5 w-3.5 ${typeIconColor[activity.type] || "text-ink-faint"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-ink leading-snug">{activity.message}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[10px] text-ink-faint">{activity.actor}</span>
                    <span className="text-[10px] text-ink-faint">·</span>
                    <span className="text-[10px] text-ink-faint">{timeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
      <button
        onClick={onClose}
        className="w-full border-t border-[var(--color-edge)] py-2.5 text-xs font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-charcoal)]"
      >
        View all activity
      </button>
    </motion.div>
  );
}
