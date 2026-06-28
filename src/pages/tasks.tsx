import { motion } from "framer-motion";
import { Plus, CheckSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/shared/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

const taskSchema = z.object({
  title: z.string().min(2, "Title is required"),
  project: z.string().min(2, "Project is required"),
  assignee: z.string().min(2, "Assignee is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueDate: z.string().min(1, "Due date is required"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

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
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "medium" }
  });

  const createMutation = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      const newTask = {
        id: Math.random().toString(36).substring(2, 9),
        ...values,
        status: "todo",
      };
      const { error } = await supabase.from("tasks").insert([newTask]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setCreateOpen(false);
      reset();
    },
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*");
      if (error) throw error;
      return data as Task[];
    },
  });

  return (
    <div>
      <PageHeader
        title="Tasks"
        description={`${tasks.filter((t) => t.status !== "completed").length} open tasks across all projects`}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New Task
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-ink-dim">Loading tasks...</div>
        </Card>
      ) : (
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
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Add a new task to your board.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">Title</label>
                <Input placeholder="E.g., Review PRs" {...register("title")} />
                {errors.title && <p className="mt-1 text-[10px] text-rose">{errors.title.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">Project</label>
                <Input placeholder="Select project" {...register("project")} />
                {errors.project && <p className="mt-1 text-[10px] text-rose">{errors.project.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">Assignee</label>
                <Input placeholder="Team member name" {...register("assignee")} />
                {errors.assignee && <p className="mt-1 text-[10px] text-rose">{errors.assignee.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">Priority</label>
                <Select onValueChange={(val) => setValue("priority", val as any)} defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">Due date</label>
                <Input type="date" {...register("dueDate")} />
                {errors.dueDate && <p className="mt-1 text-[10px] text-rose">{errors.dueDate.message}</p>}
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
