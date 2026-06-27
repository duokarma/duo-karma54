import { motion } from "framer-motion";
import { Plus, CheckSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/shared/avatar";
import { Badge } from "@/components/ui/badge";
import { tasks } from "@/data/tasks";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

const columns: { key: Task["status"]; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "review", label: "In Review" },
  { key: "completed", label: "Completed" },
];

const priorityVariant: Record<string, "outline" | "info" | "warning" | "danger"> = {
  low: "outline",
  medium: "info",
  high: "warning",
  urgent: "danger",
};

function TaskCard({ task, index }: { task: Task; index: number }) {
  const isOverdue = new Date(task.dueDate) < new Date("2026-06-27") && task.status !== "completed";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Card className="cursor-pointer p-4 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-ink leading-snug">{task.title}</p>
          <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
        </div>
        <p className="mt-1.5 text-xs text-ink-faint">{task.project}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Avatar seed={task.assignee} size="xs" />
            <span className="text-[11px] text-ink-faint">{task.assignee}</span>
          </div>
          <span className={cn("text-[11px]", isOverdue ? "text-rose" : "text-ink-faint")}>
            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

export function TasksPage() {
  return (
    <div>
      <PageHeader
        title="Tasks"
        description={`${tasks.filter((t) => t.status !== "completed").length} open tasks across all projects`}
        actions={
          <Button>
            <Plus className="h-4 w-4" /> New Task
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key}>
              <div className="mb-3 flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{col.label}</p>
                <span className="ml-auto text-xs text-ink-faint tabular">{colTasks.length}</span>
              </div>
              <div className="space-y-3">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-dashed border-edge p-6 text-center">
                    <CheckSquare className="h-5 w-5 text-ink-faint" />
                    <p className="text-xs text-ink-faint">No tasks</p>
                  </div>
                ) : (
                  colTasks.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
