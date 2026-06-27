import { motion } from "framer-motion";
import { CreditCard, FolderKanban, Target, FileText, Users, CheckSquare } from "lucide-react";
import { activities } from "@/data/misc";
import { cn } from "@/lib/utils";

const typeIcon = {
  payment: CreditCard,
  project: FolderKanban,
  lead: Target,
  invoice: FileText,
  client: Users,
  task: CheckSquare,
};

const typeColor = {
  payment: "text-emerald bg-emerald/12",
  project: "text-electric bg-electric/12",
  lead: "text-violet bg-violet/12",
  invoice: "text-cyan bg-cyan/12",
  client: "text-amber bg-amber/12",
  task: "text-rose bg-rose/12",
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-12 z-50 w-80 rounded-[var(--radius-card)] glass-panel-strong shadow-[var(--shadow-panel)] overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-edge px-4 py-3">
        <p className="font-display text-sm font-medium text-ink">Notifications</p>
        <span className="text-xs text-ink-faint">{activities.length} new</span>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {activities.map((activity) => {
          const Icon = typeIcon[activity.type];
          return (
            <button
              key={activity.id}
              onClick={onClose}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
            >
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", typeColor[activity.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink leading-snug">{activity.message}</p>
                <p className="mt-0.5 text-[11px] text-ink-faint">{timeAgo(activity.timestamp)}</p>
              </div>
            </button>
          );
        })}
      </div>
      <button onClick={onClose} className="w-full border-t border-edge py-2.5 text-xs font-medium text-electric hover:bg-white/[0.03] transition-colors">
        View all activity
      </button>
    </motion.div>
  );
}
