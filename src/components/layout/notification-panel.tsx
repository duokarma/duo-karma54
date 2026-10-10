import React, { useState } from "react";
import { m as motion } from "framer-motion";
import {
  CreditCard, FolderKanban, Target, FileText, Users,
  CheckSquare, Smartphone, BellRing, Check, X, AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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

function timeAgo(timestamp?: string): string {
  if (!timestamp) return "Just now";
  try {
    const time = new Date(timestamp).getTime();
    if (isNaN(time)) return "Just now";
    const diff = Date.now() - time;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch {
    return "Just now";
  }
}

function getRouteForActivity(type?: string): string {
  switch (type) {
    case "lead":
      return "/admin/leads";
    case "payment":
    case "invoice":
      return "/admin/revenue";
    case "project":
      return "/admin/projects";
    case "client":
      return "/admin/clients";
    case "task":
      return "/admin/tasks";
    default:
      return "/admin/leads";
  }
}

// Inline Error Boundary to prevent any child exception from crashing the entire app into a blank screen
interface ErrorBoundaryState {
  hasError: boolean;
}

class NotificationErrorBoundary extends React.Component<
  { children: React.ReactNode; onClose: () => void },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onClose: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("[NotificationPanel] Caught error in notification tree:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-[calc(100vw-1.5rem)] max-w-[360px] sm:w-[360px] rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <p className="text-xs font-semibold text-white">Notifications</p>
            </div>
            <button
              onClick={this.props.onClose}
              className="text-white/60 hover:text-white p-1 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-ink-dim mb-3">
            Unable to load push alerts on this device mode. Your activity log is safe.
          </p>
          <button
            onClick={this.props.onClose}
            className="w-full py-1.5 text-xs rounded bg-white/10 text-white hover:bg-white/15"
          >
            Close
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotificationContent({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { isEnabled, enableNotifications, isSupported } = usePushNotifications();
  const [enabling, setEnabling] = useState(false);

  const { data: rawActivities, isLoading, isError } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(10);
        if (error) throw error;
        return (data as Activity[]) || [];
      } catch (err) {
        console.warn("[NotificationPanel] Failed to fetch activities:", err);
        return [];
      }
    },
  });

  const activities: Activity[] = Array.isArray(rawActivities) ? rawActivities : [];

  const handleTestNotification = async () => {
    try {
      await showPushNotification({
        title: "🎯 Duo Karma Test Notification",
        body: "Instant phone alerts are working perfectly! You will get notified when website bookings come in.",
        url: "/admin/leads",
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleEnableClick = async () => {
    setEnabling(true);
    try {
      await enableNotifications();
    } finally {
      setEnabling(false);
    }
  };

  const handleItemClick = (type?: string) => {
    onClose();
    navigate(getRouteForActivity(type));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className="w-[calc(100vw-1.5rem)] max-w-[360px] sm:w-[360px] rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-edge)] px-3.5 py-2.5 bg-[var(--color-void)]/60">
        <div className="flex items-center gap-1.5">
          <p className="text-xs sm:text-sm font-semibold text-ink">Notifications</p>
          {isEnabled && (
            <span className="flex items-center gap-1 rounded-full bg-[#10B981]/15 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-[#10B981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-[#2563EB]/25 bg-[#2563EB]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#2563EB]">
            {activities.length} new
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded text-ink-faint hover:text-ink hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close notifications"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
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
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink">Get Notifications on Phone</p>
                  <p className="text-[11px] text-ink-dim leading-tight">
                    Receive instant alerts when someone submits a booking on your website.
                  </p>
                </div>
              </div>
              <button
                onClick={handleEnableClick}
                disabled={enabling}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <BellRing className="h-3.5 w-3.5" />
                {enabling ? "Requesting permission..." : "Enable Phone Alerts"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-1.5 text-[#10B981] min-w-0">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium text-ink-dim truncate text-[11px] sm:text-xs">Phone Alerts Enabled</span>
              </div>
              <button
                onClick={handleTestNotification}
                className="shrink-0 rounded border border-[var(--color-edge)] bg-[var(--color-void)] px-2 py-1 text-[11px] font-medium text-ink-dim transition-colors hover:text-white cursor-pointer"
              >
                Test Alert
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity List */}
      <div className="max-h-64 sm:max-h-72 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-xs text-ink-dim">Loading notifications...</div>
        ) : isError || activities.length === 0 ? (
          <div className="p-4 text-center text-xs text-ink-dim">No notifications yet</div>
        ) : (
          activities.map((activity, index) => {
            if (!activity) return null;
            const Icon = (activity.type && typeIcon[activity.type]) || CheckSquare;
            const iconColor = (activity.type && typeIconColor[activity.type]) || "text-ink-faint";
            const message = typeof activity.message === "string" ? activity.message : "New activity recorded";

            return (
              <button
                key={activity.id || `act-${index}`}
                onClick={() => handleItemClick(activity.type)}
                className="flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--color-charcoal)] cursor-pointer"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--color-edge)] bg-[var(--color-void)]">
                  <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-ink leading-snug break-words">{message}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[10px] text-ink-faint truncate max-w-[120px]">
                      {activity.actor || "System"}
                    </span>
                    <span className="text-[10px] text-ink-faint">·</span>
                    <span className="text-[10px] text-ink-faint shrink-0">{timeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <button
        onClick={() => {
          onClose();
          navigate("/admin/leads");
        }}
        className="w-full border-t border-[var(--color-edge)] py-2 text-xs font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-charcoal)] cursor-pointer"
      >
        View all activity
      </button>
    </motion.div>
  );
}

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  return (
    <NotificationErrorBoundary onClose={onClose}>
      <NotificationContent onClose={onClose} />
    </NotificationErrorBoundary>
  );
}
