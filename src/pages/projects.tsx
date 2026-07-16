import { useMemo, useState } from "react";
import { motion } from "framer-motion";
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
import type { Project } from "@/types";


const projectSchema = z.object({
  name: z.string().min(2, "Name is required"),
  client: z.string().min(2, "Client is required"),
  budget: z.coerce.number().min(0, "Budget must be a number"),
  websiteLink: z.string().optional().or(z.literal("")),
  vercelLink: z.string().optional().or(z.literal("")),
  githubLink: z.string().optional().or(z.literal("")),
  databaseLink: z.string().optional().or(z.literal("")),
});

type ProjectFormValues = z.infer<typeof projectSchema>;



export function ProjectsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
  });

  const createMutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const newProject = {
        id: Math.random().toString(36).substring(2, 9),
        ...values,
        status: "pending",
        progress: 0,
        spent: 0,
        startDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        team: ["Hatim"],
        priority: "medium",
      };
      const { error } = await supabase.from("projects").insert([newProject]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setAddOpen(false);
      reset();
    },
  });

  const editMutation = useMutation({
    mutationFn: async (values: ProjectFormValues & { id: string }) => {
      const { id, ...rest } = values;
      const { error } = await supabase.from("projects").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setAddOpen(false);
      setSelectedProject(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Project["status"] }) => {
      const { error } = await supabase.from("projects").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const openEditDrawer = (project: Project) => {
    setSelectedProject(project);
    reset({
      name: project.name,
      client: project.client,
      budget: project.budget,
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
      const { data, error } = await supabase.from("projects").select("*");
      if (error) throw error;
      return data as Project[];
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
          <SelectTrigger className="w-44">
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
                  <div className="flex items-start justify-end gap-2">
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
                          <DropdownMenuItem onClick={() => openEditDrawer(project)}>
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
          reset({ name: "", client: "", budget: 0, websiteLink: "", vercelLink: "", githubLink: "", databaseLink: "" });
        }
      }}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedProject ? "Edit Project" : "Create New Project"}</DrawerTitle>
            <DrawerDescription>{selectedProject ? "Update project details." : "Set up a new project tracking space."}</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit((data) => {
            if (selectedProject) {
              editMutation.mutate({ ...data, id: selectedProject.id });
            } else {
              createMutation.mutate(data);
            }
          })} className="space-y-4">
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
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Budget</label>
              <Input placeholder="50000" type="number" {...register("budget")} />
              {errors.budget && <p className="mt-1 text-[10px] text-rose">{errors.budget.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            <Button className="w-full" type="submit" disabled={createMutation.isPending || editMutation.isPending}>
              {createMutation.isPending || editMutation.isPending ? "Saving..." : selectedProject ? "Save Changes" : "Create Project"}
            </Button>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
