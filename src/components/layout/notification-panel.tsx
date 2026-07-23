import { m as motion } from "framer-motion";
import { CreditCard, FolderKanban, Target, FileText, Users, CheckSquare, Smartphone, BellRing, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Activity } from "@/types";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { showPushNotification } from "@/lib/push-notifications";

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
  const { isEnabled, enableNotifications, isSupported } = usePushNotifications();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activities").select("*").order("timestamp", { ascending: false }).limit(10);
      if (error) throw error;
      return data as Activity[];
    },
  });

  const handleTestNotification = () => {
    showPushNotification({
      title: "🎯 Duo Karma Test Notification",
      body: "Instant phone alerts are working perfectly! You will get notified when website bookings come in.",
      url: "/admin/leads",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-9 z-50 w-84 rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] shadow-[var(--shadow-dropdown)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-edge)] px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-ink">Notifications</p>
          {isEnabled && (
            <span className="flex items-center gap-1 rounded-full bg-[#10B981]/15 px-2 py-0.5 text-[10px] font-semibold text-[#10B981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Phone Alerts Active
            </span>
          )}
        </div>
        <span className="rounded-md border border-[#2563EB]/25 bg-[#2563EB]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#2563EB]">
          {activities.length} new
        </span>
      </div>

      {/* Phone Notification Banner */}
      {isSupported && (
        <div className="border-b border-[var(--color-edge)] bg-[var(--color-charcoal)]/50 p-3">
          {!isEnabled ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-ink">Get Notifications on Phone</p>
                  <p className="text-[11px] text-ink-dim leading-tight">Receive instant alerts when someone submits a booking on your website.</p>
                </div>
              </div>
              <button
                onClick={enableNotifications}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 shadow-sm"
              >
                <BellRing className="h-3.5 w-3.5" />
                Enable Phone Alerts
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#10B981]">
                <Check className="h-3.5 w-3.5" />
                <span className="font-medium text-ink-dim">Phone Alerts Enabled</span>
              </div>
              <button
                onClick={handleTestNotification}
                className="rounded border border-[var(--color-edge)] bg-[var(--color-void)] px-2 py-1 text-[11px] font-medium text-ink-dim transition-colors hover:text-white"
              >
                Test Alert
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity List */}
      <div className="max-h-72 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-ink-dim">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="p-4 text-center text-sm text-ink-dim">No notifications</div>
        ) : (
          activities.map((activity) => {
            const Icon = typeIcon[activity.type] || CheckSquare;
            return (
              <button
                key={activity.id}
                onClick={onClose}
                className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--color-charcoal)]"
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
