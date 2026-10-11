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
import { logActivity } from "@/lib/activity-logger";
import { useToast } from "@/components/ui/toast";
import type { Task, Project } from "@/types";

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
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "medium" }
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("name", { ascending: true });
      if (error) return [];
      return (data || []) as Project[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      const newTask = {
        id: Math.random().toString(36).substring(2, 9),
        title: values.title.trim(),
        project: values.project.trim(),
        assignee: values.assignee.trim(),
        priority: values.priority,
        dueDate: values.dueDate ? values.dueDate.split("T")[0] : new Date().toISOString().split("T")[0],
        status: "todo" as const,
      };
      const { data, error } = await supabase.from("tasks").insert([newTask]).select();
      if (error) throw error;
      const created = data && data[0] ? (data[0] as Task) : (newTask as Task);
      logActivity({
        type: "task",
        message: `Task "${created.title}" created for ${created.project}`,
        actor: created.assignee,
      });
      return created;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<Task[]>(["tasks"], (old) => {
        return old ? [created, ...old] : [created];
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      setIsDialogOpen(false);
      reset();
      toast({
        title: "Task Created",
        description: `Task "${created.title}" added to ${created.project}.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to create task",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (values: TaskFormValues & { id: string }) => {
      const { id, ...rest } = values;
      const payload = {
        title: rest.title.trim(),
        project: rest.project.trim(),
        assignee: rest.assignee.trim(),
        priority: rest.priority,
        dueDate: rest.dueDate ? rest.dueDate.split("T")[0] : new Date().toISOString().split("T")[0],
      };
      const { data, error } = await supabase.from("tasks").update(payload).eq("id", id).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Task not found or update could not be completed.");
      }
      const updated = data[0] as Task;
      logActivity({
        type: "task",
        message: `Task "${updated.title}" updated`,
        actor: updated.assignee,
      });
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Task[]>(["tasks"], (old) => {
        if (!old) return [updated];
        return old.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      setIsDialogOpen(false);
      setSelectedTask(null);
      reset();
      toast({
        title: "Changes Saved",
        description: `Task "${updated.title}" updated successfully.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to update task",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      logActivity({
        type: "task",
        message: `Task deleted`,
      });
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Task[]>(["tasks"], (old) => {
        if (!old) return old;
        return old.filter((t) => t.id !== deletedId);
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast({
        title: "Task Deleted",
        description: "Task removed from workspace.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to delete task",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task["status"] }) => {
      const { data, error } = await supabase.from("tasks").update({ status }).eq("id", id).select();
      if (error) throw error;
      logActivity({
        type: "task",
        message: `Task status updated to ${status}`,
      });
      return data && data[0] ? (data[0] as Task) : { id, status };
    },
    onSuccess: (updated: any) => {
      queryClient.setQueryData<Task[]>(["tasks"], (old) => {
        if (!old) return old;
        return old.map((t) => (t.id === updated.id ? { ...t, status: updated.status } : t));
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    reset({
      title: task.title,
      project: task.project,
      assignee: task.assignee,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : "",
    });
    setIsDialogOpen(true);
  };

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("dueDate", { ascending: true });
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
          <form
            onSubmit={handleSubmit(
              (data) => {
                if (selectedTask) {
                  editMutation.mutate({ ...data, id: selectedTask.id });
                } else {
                  createMutation.mutate(data);
                }
              },
              (valErrors) => {
                const firstMsg = Object.values(valErrors)[0]?.message as string;
                toast({
                  title: "Please check form fields",
                  description: firstMsg || "One or more fields require correction.",
                  variant: "destructive",
                });
              }
            )}
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">Title</label>
                <Input placeholder="E.g., Review PRs" {...register("title")} />
                {errors.title && <p className="mt-1 text-[10px] text-rose">{errors.title.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">Project</label>
                <Input
                  list="project-options"
                  placeholder="Select or enter project name"
                  {...register("project")}
                />
                <datalist id="project-options">
                  {projects.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
                {errors.project && <p className="mt-1 text-[10px] text-rose">{errors.project.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">Assignee</label>
                <Input placeholder="Team member name" {...register("assignee")} />
                {errors.assignee && <p className="mt-1 text-[10px] text-rose">{errors.assignee.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">Priority</label>
                <Select
                  onValueChange={(val) => setValue("priority", val as any, { shouldDirty: true, shouldValidate: true })}
                  defaultValue="medium"
                >
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
