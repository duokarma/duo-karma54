import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  FolderKanban,
  TrendingUp,
  Plus,
  FileText,
  UserPlus,
  Calendar,
  ArrowUpRight,
  CreditCard,
  Target,
  CheckSquare,
} from "lucide-react";
import { KPICard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { CrystalScene } from "@/components/three/crystal-scene";
import { FinancialsAreaChart } from "@/components/charts/financials-area-chart";
import { ExpensesBarChart } from "@/components/charts/expenses-bar-chart";
import { ProfitLineChart } from "@/components/charts/profit-line-chart";
import { monthlyFinancials, activities } from "@/data/misc";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Client, Project } from "@/types";

const typeIcon = {
  payment: CreditCard,
  project: FolderKanban,
  lead: Target,
  invoice: FileText,
  client: Users,
  task: CheckSquare,
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function DashboardPage() {
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*");
      return (data || []) as Project[];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*");
      return (data || []) as Client[];
    },
  });

  const activeProjects = projects.filter((p) => p.status === "in-progress").slice(0, 4);
  const recentClients = [...clients].sort((a, b) => b.joinedDate.localeCompare(a.joinedDate)).slice(0, 4);

  return (
    <div>
      {/* Hero / Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-6 overflow-hidden rounded-[var(--radius-panel)] glass-panel-strong p-6 shadow-[var(--shadow-panel)] sm:p-8"
      >
        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-medium text-ink-faint">Welcome back</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Here's how the business is performing
          </h1>
          <p className="mt-2 text-sm text-ink-dim">
            Revenue is up 12.2% this month, with 8 active projects across 64 clients. 3 invoices need
            attention.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm">
              <Plus className="h-4 w-4" /> New Project
            </Button>
            <Button size="sm" variant="secondary">
              <FileText className="h-4 w-4" /> Create Invoice
            </Button>
          </div>
        </div>
        <div className="absolute -right-10 top-1/2 h-[280px] w-[380px] -translate-y-1/2 sm:-right-4 sm:h-[320px] sm:w-[420px]">
          <CrystalScene className="h-full w-full" />
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Revenue" value={1037000} prefix="$" change={12.2} icon={DollarSign} accent="blue" />
        <KPICard label="Active Clients" value={64} change={9.8} icon={Users} accent="cyan" />
        <KPICard label="Active Projects" value={8} change={3.1} icon={FolderKanban} accent="violet" />
        <KPICard label="Net Profit" value={97000} prefix="$" change={18.5} icon={TrendingUp} accent="amber" />
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <FinancialsAreaChart data={monthlyFinancials} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesBarChart data={monthlyFinancials} height={260} />
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Active Projects */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Active Projects</CardTitle>
            <Link to="/projects" className="text-xs text-electric hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeProjects.map((project) => (
              <div key={project.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-ink">{project.name}</p>
                    <span className="shrink-0 text-xs text-ink-faint tabular">{project.progress}%</span>
                  </div>
                  <p className="text-xs text-ink-faint">{project.client}</p>
                  <Progress value={project.progress} className="mt-2 h-1.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Profit trend */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitLineChart data={monthlyFinancials} height={240} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.slice(0, 5).map((activity) => {
              const Icon = typeIcon[activity.type];
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                    <Icon className="h-3.5 w-3.5 text-ink-dim" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-ink-dim leading-snug">{activity.message}</p>
                    <p className="mt-0.5 text-[11px] text-ink-faint">{timeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Clients</CardTitle>
            <Link to="/clients" className="text-xs text-electric hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentClients.map((client) => (
              <div key={client.id} className="flex items-center gap-3">
                <Avatar seed={client.avatarSeed} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink">{client.name}</p>
                  <p className="truncate text-[11px] text-ink-faint">{client.company}</p>
                </div>
                <StatusBadge status={client.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions + Upcoming */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Add Client", icon: UserPlus, to: "/clients" },
              { label: "New Invoice", icon: FileText, to: "/invoices" },
              { label: "Schedule Meeting", icon: Calendar, to: "/calendar" },
              { label: "Create Task", icon: CheckSquare, to: "/tasks" },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex items-center gap-3 rounded-[var(--radius-control)] border border-edge bg-white/[0.02] px-3 py-2.5 text-sm text-ink-dim transition-colors hover:bg-white/[0.05] hover:text-ink"
              >
                <action.icon className="h-4 w-4 text-electric" />
                {action.label}
                <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-ink-faint" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
