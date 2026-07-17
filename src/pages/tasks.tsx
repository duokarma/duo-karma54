import { m as motion } from "framer-motion";
import { Plus, CheckSquare, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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

function TaskCard({ task, index, onEdit, onDelete, onStatusChange }: { task: Task; index: number; onEdit: () => void; onDelete: () => void; onStatusChange: (status: Task["status"]) => void }) {
  const isOverdue = new Date(task.dueDate) < new Date("2026-06-27") && task.status !== "completed";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Card className="p-4 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-ink leading-snug">{task.title}</p>
          <div className="flex items-center gap-1">
            <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="-mr-2 h-6 w-6">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs font-semibold text-ink-faint">Move to</DropdownMenuLabel>
                {columns.map((c) => (
                  c.key !== task.status && (
                    <DropdownMenuItem key={c.key} onClick={() => onStatusChange(c.key as Task["status"])}>
                      {c.label}
                    </DropdownMenuItem>
                  )
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-rose focus:text-rose">
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
      setIsDialogOpen(false);
      reset();
    },
  });

  const editMutation = useMutation({
    mutationFn: async (values: TaskFormValues & { id: string }) => {
      const { id, ...rest } = values;
      const { error } = await supabase.from("tasks").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsDialogOpen(false);
      setSelectedTask(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task["status"] }) => {
      const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    reset({
      title: task.title,
      project: task.project,
      assignee: task.assignee,
      priority: task.priority,
      dueDate: task.dueDate.split('T')[0],
    });
    setIsDialogOpen(true);
  };

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
          <Button onClick={() => setIsDialogOpen(true)}>
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
                  colTasks.map((task, i) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      index={i} 
                      onEdit={() => openEditDialog(task)}
                      onDelete={() => deleteMutation.mutate(task.id)}
                      onStatusChange={(status) => statusMutation.mutate({ id: task.id, status })}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSelectedTask(null);
          reset({ title: "", project: "", assignee: "", priority: "medium", dueDate: "" });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask ? "Edit Task" : "Create Task"}</DialogTitle>
            <DialogDescription>{selectedTask ? "Update task details." : "Add a new task to your board."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((data) => {
            if (selectedTask) {
              editMutation.mutate({ ...data, id: selectedTask.id });
            } else {
              createMutation.mutate(data);
            }
          })}>
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
              <Button variant="secondary" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || editMutation.isPending}>
                {createMutation.isPending || editMutation.isPending ? "Saving..." : selectedTask ? "Save Changes" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
