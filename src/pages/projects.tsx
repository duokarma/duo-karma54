import { useMemo, useState, useEffect } from "react";
import { m as motion } from "framer-motion";
import { Plus, Search, FolderKanban, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TiltCard, GlowBorder, AnimatedBadge } from "@/components/premium";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import type { Project } from "@/types";


import { formatCurrency } from "@/lib/utils";
import { logActivity } from "@/lib/activity-logger";
import { useToast } from "@/components/ui/toast";

const projectSchema = z.object({
  name: z.string().min(2, "Name is required"),
  client: z.string().min(2, "Client is required"),
  budget: z.coerce.number().min(0, "Budget must be a number"),
  spent: z.coerce.number().min(0).default(0),
  progress: z.coerce.number().min(0).max(100).default(0),
  status: z.enum(["pending", "in-progress", "completed", "on-hold"]).default("pending"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.string().optional().or(z.literal("")),
  websiteLink: z.string().optional().or(z.literal("")),
  vercelLink: z.string().optional().or(z.literal("")),
  githubLink: z.string().optional().or(z.literal("")),
  databaseLink: z.string().optional().or(z.literal("")),
});

type ProjectFormValues = z.infer<typeof projectSchema>;



export function ProjectsPage() {
  const queryClient = useQueryClient();
  const { displayName } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedPartner, setAssignedPartner] = useState<"Hatim" | "Moiz" | "Both">(
    displayName === "Moiz" ? "Moiz" : "Hatim"
  );
  const [addOpen, setAddOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      name: "",
      client: "",
      budget: 0,
      spent: 0,
      progress: 0,
      status: "pending",
      priority: "medium",
      dueDate: "",
      websiteLink: "",
      vercelLink: "",
      githubLink: "",
      databaseLink: "",
    },
  });

  const currentStatus = watch("status");
  const currentPriority = watch("priority");

  // Real-time synchronization for projects table
  useEffect(() => {
    const channelId = `projects_realtime_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const team = assignedPartner === "Both" ? ["Hatim", "Moiz"] : [assignedPartner];
      const cleanDueDate = values.dueDate && values.dueDate.trim() !== ""
        ? values.dueDate.split("T")[0]
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const newProject = {
        id: Math.random().toString(36).substring(2, 9),
        name: values.name.trim(),
        client: values.client.trim(),
        budget: Number(values.budget) || 0,
        spent: Number(values.spent) || 0,
        progress: Number(values.progress) || 0,
        status: values.status || "pending",
        priority: values.priority || "medium",
        startDate: new Date().toISOString().split("T")[0],
        dueDate: cleanDueDate,
        websiteLink: values.websiteLink?.trim() || "",
        vercelLink: values.vercelLink?.trim() || "",
        githubLink: values.githubLink?.trim() || "",
        databaseLink: values.databaseLink?.trim() || "",
        team,
      };

      const { data, error } = await supabase.from("projects").insert([newProject]).select();
      if (error) throw error;
      const created = data && data[0] ? (data[0] as Project) : (newProject as Project);

      logActivity({
        type: "project",
        message: `Project "${created.name}" created for ${created.client || "Client"}`,
        actor: assignedPartner === "Both" ? "Partners" : assignedPartner,
      });
      return created;
    },
    onSuccess: (newProject) => {
      queryClient.setQueryData<Project[]>(["projects"], (old) => {
        return old ? [newProject, ...old] : [newProject];
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      setAddOpen(false);
      reset();
      toast({
        title: "Project Created",
        description: `Project "${newProject.name}" has been added.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to create project",
        description: err.message || "An error occurred while creating the project.",
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (values: ProjectFormValues & { id: string }) => {
      const team = assignedPartner === "Both" ? ["Hatim", "Moiz"] : [assignedPartner];
      const { id, ...rest } = values;

      // Ensure empty string is converted to null for PostgreSQL DATE type
      const cleanDueDate = rest.dueDate && rest.dueDate.trim() !== ""
        ? rest.dueDate.split("T")[0]
        : null;

      const payload = {
        name: rest.name.trim(),
        client: rest.client.trim(),
        budget: Number(rest.budget) || 0,
        spent: Number(rest.spent) || 0,
        progress: Number(rest.progress) || 0,
        status: rest.status || "pending",
        priority: rest.priority || "medium",
        dueDate: cleanDueDate,
        websiteLink: rest.websiteLink?.trim() || "",
        vercelLink: rest.vercelLink?.trim() || "",
        githubLink: rest.githubLink?.trim() || "",
        databaseLink: rest.databaseLink?.trim() || "",
        team,
      };

      const { data, error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Project not found or update could not be completed.");
      }

      const updated = data[0] as Project;

      logActivity({
        type: "project",
        message: `Project "${updated.name}" details updated`,
        actor: assignedPartner === "Both" ? "Partners" : assignedPartner,
      });

      return updated;
    },
    onSuccess: (updated) => {
      // Instantly update the cache so UI reflects all fields with 0ms latency
      queryClient.setQueryData<Project[]>(["projects"], (old) => {
        if (!old) return [updated];
        return old.map((p) => (p.id === updated.id ? { ...p, ...updated } : p));
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      setAddOpen(false);
      setSelectedProject(null);
      reset();
      toast({
        title: "Changes Saved",
        description: `Project "${updated.name}" updated successfully.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to update project",
        description: err.message || "An error occurred while saving project changes.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      logActivity({
        type: "project",
        message: `Project removed from workspace`,
        actor: "Partner",
      });
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Project[]>(["projects"], (old) => {
        if (!old) return old;
        return old.filter((p) => p.id !== deletedId);
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast({
        title: "Project Deleted",
        description: "Project has been removed from workspace.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to delete project",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Project["status"] }) => {
      const { data, error } = await supabase
        .from("projects")
        .update({ status })
        .eq("id", id)
        .select();
      if (error) throw error;
      logActivity({
        type: "project",
        message: `Project status updated to ${status}`,
        actor: "Partner",
      });
      return data && data[0] ? (data[0] as Project) : { id, status };
    },
    onSuccess: (updated: any) => {
      queryClient.setQueryData<Project[]>(["projects"], (old) => {
        if (!old) return old;
        return old.map((p) => (p.id === updated.id ? { ...p, status: updated.status } : p));
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast({
        title: "Status Updated",
        description: `Project status set to ${updated.status}.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to update status",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const openEditDrawer = (project: Project) => {
    setSelectedProject(project);
    if (project.team?.includes("Hatim") && project.team?.includes("Moiz")) {
      setAssignedPartner("Both");
    } else if (project.team?.includes("Moiz")) {
      setAssignedPartner("Moiz");
    } else {
      setAssignedPartner("Hatim");
    }
    reset({
      name: project.name,
      client: project.client,
      budget: project.budget,
      spent: project.spent || 0,
      progress: project.progress || 0,
      status: project.status || "pending",
      priority: project.priority || "medium",
      dueDate: project.dueDate ? project.dueDate.split("T")[0] : "",
      websiteLink: project.websiteLink || "",
      vercelLink: project.vercelLink || "",
      githubLink: project.githubLink || "",
      databaseLink: project.databaseLink || "",
    });
    setAddOpen(true);
  };

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("startDate", { ascending: false });
      if (error) throw error;
      return (data || []) as Project[];
    },
  });

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesQuery =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.client.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [projects, query, statusFilter]);

  return (
    <div>
      <PageHeader
        title="Projects"
        description={`${projects.length} projects · ${projects.filter((p) => p.status === "in-progress").length} in progress`}
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input placeholder="Search projects..." className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-ink-dim">Loading projects...</div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderKanban}
            title="No projects found"
            description="Try adjusting your search or filters."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery("");
              setStatusFilter("all");
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <TiltCard className="h-full">
                <GlowBorder color="rgba(37,99,235,0.4)" className="h-full w-full rounded-[var(--radius-card)]">
                  <Card className="h-full border-none shadow-none bg-[var(--color-card)] relative z-10">
                    <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {project.team && project.team.length > 0 && (
                        <span
                          className="text-[10px] rounded px-2 py-0.5 border font-medium flex items-center gap-1"
                          style={{
                            borderColor: project.team.includes("Moiz") && !project.team.includes("Hatim")
                              ? "#10B98150"
                              : project.team.includes("Hatim") && !project.team.includes("Moiz")
                              ? "#6366F150"
                              : "#8B5CF650",
                            color: project.team.includes("Moiz") && !project.team.includes("Hatim")
                              ? "#34D399"
                              : project.team.includes("Hatim") && !project.team.includes("Moiz")
                              ? "#818CF8"
                              : "#C084FC",
                            backgroundColor: project.team.includes("Moiz") && !project.team.includes("Hatim")
                              ? "#10B98115"
                              : project.team.includes("Hatim") && !project.team.includes("Moiz")
                              ? "#6366F115"
                              : "#8B5CF615",
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor: project.team.includes("Moiz") && !project.team.includes("Hatim")
                                ? "#34D399"
                                : project.team.includes("Hatim") && !project.team.includes("Moiz")
                                ? "#818CF8"
                                : "#C084FC",
                            }}
                          />
                          {project.team.join(" & ")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none">
                          <StatusBadge status={project.status} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel className="text-xs font-semibold text-ink-faint">Change Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => statusMutation.mutate({ id: project.id, status: "pending" })}>Pending</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => statusMutation.mutate({ id: project.id, status: "in-progress" })}>In Progress</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => statusMutation.mutate({ id: project.id, status: "completed" })}>Completed</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => statusMutation.mutate({ id: project.id, status: "on-hold" })}>On Hold</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="-mr-2 h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => {
                              setTimeout(() => openEditDrawer(project), 50);
                            }}
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => deleteMutation.mutate(project.id)} className="text-rose focus:text-rose">
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="mt-3 font-display text-xl font-semibold text-ink">{project.name}</p>
                  <p className="text-sm text-ink-faint">{project.client}</p>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-ink-faint">Budget: </span>
                      <span className="font-semibold text-ink">{formatCurrency(project.budget || 0)}</span>
                    </div>
                    {project.spent !== undefined && project.spent > 0 && (
                      <div>
                        <span className="text-ink-faint">Spent: </span>
                        <span className="font-semibold text-amber-400">{formatCurrency(project.spent)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-ink-faint">Progress</span>
                      <span className="font-medium text-ink">{project.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, project.progress || 0))}%` }}
                      />
                    </div>
                  </div>

                  {(project.priority || project.dueDate) && (
                    <div className="mt-3 flex items-center justify-between text-[11px] text-ink-faint">
                      {project.priority && (
                        <span className="capitalize px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px]">
                          {project.priority} priority
                        </span>
                      )}
                      {project.dueDate && (
                        <span>Due {project.dueDate}</span>
                      )}
                    </div>
                  )}

                  {(project.websiteLink || project.vercelLink || project.githubLink || project.databaseLink) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.websiteLink && (
                        <a href={project.websiteLink} target="_blank" rel="noopener noreferrer">
                          <AnimatedBadge variant="default" className="bg-electric/10 text-electric hover:bg-electric/20 cursor-pointer">Website</AnimatedBadge>
                        </a>
                      )}
                      {project.vercelLink && (
                        <a href={project.vercelLink} target="_blank" rel="noopener noreferrer">
                          <AnimatedBadge variant="default" className="bg-electric/10 text-electric hover:bg-electric/20 cursor-pointer">Vercel</AnimatedBadge>
                        </a>
                      )}
                      {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                          <AnimatedBadge variant="default" className="bg-electric/10 text-electric hover:bg-electric/20 cursor-pointer">GitHub</AnimatedBadge>
                        </a>
                      )}
                      {project.databaseLink && (
                        <a href={project.databaseLink} target="_blank" rel="noopener noreferrer">
                          <AnimatedBadge variant="default" className="bg-electric/10 text-electric hover:bg-electric/20 cursor-pointer">Database</AnimatedBadge>
                        </a>
                      )}
                    </div>
                  )}

                </CardContent>
              </Card>
            </GlowBorder>
          </TiltCard>
        </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Project Drawer */}
      <Drawer open={addOpen} onOpenChange={(open) => {
        setAddOpen(open);
        if (!open) {
          setSelectedProject(null);
          setAssignedPartner(displayName === "Moiz" ? "Moiz" : "Hatim");
          reset({
            name: "",
            client: "",
            budget: 0,
            spent: 0,
            progress: 0,
            status: "pending",
            priority: "medium",
            dueDate: "",
            websiteLink: "",
            vercelLink: "",
            githubLink: "",
            databaseLink: "",
          });
        }
      }}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader>
            <DrawerTitle>{selectedProject ? "Edit Project" : "Create New Project"}</DrawerTitle>
            <DrawerDescription>{selectedProject ? "Update all project details." : "Set up a new project tracking space."}</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-8">
            <form
              onSubmit={handleSubmit(
                (data) => {
                  if (selectedProject) {
                    editMutation.mutate({ ...data, id: selectedProject.id });
                  } else {
                    createMutation.mutate(data);
                  }
                },
                (valErrors) => {
                  const errorKeys = Object.keys(valErrors);
                  if (errorKeys.length > 0) {
                    const firstMsg = (valErrors as any)[errorKeys[0]]?.message;
                    toast({
                      title: "Please check form fields",
                      description: firstMsg || "One or more fields require correction.",
                      variant: "destructive",
                    });
                  }
                }
              )}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Project Name</label>
                  <Input placeholder="Rebranding Q3" {...register("name")} />
                  {errors.name && <p className="mt-1 text-[10px] text-rose">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Client</label>
                  <Input placeholder="Acme Corp" {...register("client")} />
                  {errors.client && <p className="mt-1 text-[10px] text-rose">{errors.client.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Status</label>
                  <Select
                    value={currentStatus || "pending"}
                    onValueChange={(v: any) => setValue("status", v, { shouldDirty: true, shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Priority</label>
                  <Select
                    value={currentPriority || "medium"}
                    onValueChange={(v: any) => setValue("priority", v, { shouldDirty: true, shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Budget (₹)</label>
                  <Input placeholder="50000" type="number" {...register("budget")} />
                  {errors.budget && <p className="mt-1 text-[10px] text-rose">{errors.budget.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Spent (₹)</label>
                  <Input placeholder="0" type="number" {...register("spent")} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Progress (%)</label>
                  <Input placeholder="0" type="number" min={0} max={100} {...register("progress")} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Due Date</label>
                  <Input type="date" {...register("dueDate")} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Lead Partner</label>
                  <Select value={assignedPartner} onValueChange={(v: any) => setAssignedPartner(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hatim">Hatim (Co-founder)</SelectItem>
                      <SelectItem value="Moiz">Moiz (Co-founder)</SelectItem>
                      <SelectItem value="Both">Both (Hatim & Moiz)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Website Link</label>
                  <Input placeholder="https://..." {...register("websiteLink")} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Vercel Link</label>
                  <Input placeholder="https://..." {...register("vercelLink")} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">GitHub Link</label>
                  <Input placeholder="https://..." {...register("githubLink")} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Database Link</label>
                  <Input placeholder="https://..." {...register("databaseLink")} />
                </div>
              </div>
              <Button className="w-full mt-2" type="submit" disabled={createMutation.isPending || editMutation.isPending}>
                {createMutation.isPending || editMutation.isPending ? "Saving..." : selectedProject ? "Save Changes" : "Create Project"}
              </Button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
