import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, FolderKanban, Calendar, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/shared/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projects } from "@/data/projects";
import { formatCurrency, cn } from "@/lib/utils";

const priorityDot: Record<string, string> = {
  low: "bg-ink-faint",
  medium: "bg-electric",
  high: "bg-amber",
  urgent: "bg-rose",
};

export function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesQuery =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.client.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  return (
    <div>
      <PageHeader
        title="Projects"
        description={`${projects.length} projects · ${projects.filter((p) => p.status === "in-progress").length} in progress`}
        actions={
          <Button>
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

      {filtered.length === 0 ? (
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
              <Card className="h-full transition-transform hover:-translate-y-0.5">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", priorityDot[project.priority])} />
                      <p className="text-xs uppercase tracking-wide text-ink-faint">{project.priority}</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="mt-3 font-display text-base font-semibold text-ink">{project.name}</p>
                  <p className="text-xs text-ink-faint">{project.client}</p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-faint">Progress</span>
                      <span className="tabular text-ink-dim">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="mt-1.5" />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-ink-faint">
                    <span className="tabular">
                      {formatCurrency(project.spent, true)} / {formatCurrency(project.budget, true)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.team.slice(0, 3).map((member) => (
                        <Avatar key={member} seed={member} size="xs" className="ring-2 ring-graphite" />
                      ))}
                      {project.team.length > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] text-ink-faint ring-2 ring-graphite">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-ink-faint">
                      <Users className="h-3.5 w-3.5" />
                      {project.team.length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
