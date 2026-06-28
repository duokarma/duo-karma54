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
  CheckSquare,
  CreditCard,
  Target,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { KPICard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { FinancialsAreaChart } from "@/components/charts/financials-area-chart";
import { ProfitLineChart } from "@/components/charts/profit-line-chart";
import { InvoiceDonutChart } from "@/components/charts/invoice-donut-chart";
import { monthlyFinancials } from "@/data/misc";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import type { Client, Project } from "@/types";

// ── Helpers ────────────────────────────────────────────────
const activityIconMap = {
  payment: CreditCard,
  project: FolderKanban,
  lead:    Target,
  invoice: FileText,
  client:  Users,
  task:    CheckSquare,
};

const activityColorMap = {
  payment: "text-[#10B981]",
  project: "text-[#2563EB]",
  lead:    "text-[#F59E0B]",
  invoice: "text-[#6366F1]",
  client:  "text-[#06B6D4]",
  task:    "text-ink-faint",
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function todayFormatted(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
    year:    "numeric",
  });
}

// Sparkline data derived from last 7 months of financials
const revenueSparkline  = monthlyFinancials.slice(-7).map((d) => d.revenue);
const clientsSparkline  = [48, 52, 55, 59, 60, 62, 64];
const projectsSparkline = [5, 6, 7, 8, 7, 8, 8];
const profitSparkline   = monthlyFinancials.slice(-7).map((d) => d.profit);

// ── Component ───────────────────────────────────────────────
export function DashboardPage() {
  const { user } = useAuth();

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

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data } = await supabase.from("invoices").select("*");
      return (data || []) as any[];
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*");
      return (data || []) as any[];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data } = await supabase.from("activities").select("*").order("timestamp", { ascending: false }).limit(6);
      return (data || []) as any[];
    },
  });

  const activeProjects = projects.filter((p) => p.status === "in-progress");
  const topActiveProjects = activeProjects.slice(0, 5);
  const recentClients  = [...clients]
    .sort((a, b) => b.joinedDate.localeCompare(a.joinedDate))
    .slice(0, 5);

  const displayName = user?.email?.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "there";

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0) || 1245000;
  const netProfit = totalRevenue * 0.42; 
  const activeClientsCount = clients.filter(c => c.status === "active").length || 64;
  const pendingInvoices = invoices.filter(i => i.status === "pending").length;
  const tasksDueToday = tasks.filter(t => new Date(t.dueDate).toDateString() === new Date().toDateString()).length;

  const invoiceStatusBreakdown = [
    { label: "Paid", value: invoices.filter(i => i.status === "paid").length, color: "#10B981" },
    { label: "Pending", value: invoices.filter(i => i.status === "pending").length, color: "#2563EB" },
    { label: "Overdue", value: invoices.filter(i => i.status === "overdue").length, color: "#F43F5E" },
    { label: "Draft", value: invoices.filter(i => i.status === "draft").length, color: "var(--color-ink-faint)" },
  ].filter(s => s.value > 0);

  return (
    <div className="space-y-5">

      {/* ── Header: Greeting + Business Health ── */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-ink">
              {greetingByHour()}, {displayName} 👋
            </h1>
            <p className="mt-0.5 text-xs text-ink-faint">{todayFormatted()}</p>
          </div>

          {/* Business health chips */}
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-1 text-xs font-medium text-[#10B981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              Business Health: Excellent
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-edge)] bg-[var(--color-card)] px-2.5 py-1 text-xs text-ink-dim">
              <FileText className="h-3 w-3" />
              {pendingInvoices} invoices pending
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-edge)] bg-[var(--color-card)] px-2.5 py-1 text-xs text-ink-dim">
              <CheckSquare className="h-3 w-3" />
              {tasksDueToday} tasks due today
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard
          label="Total Revenue"
          value={totalRevenue}
          prefix="₹"
          change={12.2}
          icon={DollarSign}
          accent="blue"
          sparklineData={revenueSparkline}
        />
        <KPICard
          label="Active Clients"
          value={activeClientsCount}
          change={9.8}
          icon={Users}
          accent="green"
          sparklineData={clientsSparkline}
        />
        <KPICard
          label="Active Projects"
          value={activeProjects.length}
          change={3.1}
          icon={FolderKanban}
          accent="amber"
          sparklineData={projectsSparkline}
        />
        <KPICard
          label="Net Profit"
          value={netProfit}
          prefix="₹"
          change={18.5}
          icon={TrendingUp}
          accent="green"
          sparklineData={profitSparkline}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Revenue & Profit</CardTitle>
              <p className="mt-0.5 text-[10px] text-ink-faint">Last 12 months</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-ink-faint">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#2563EB]" />Revenue</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#10B981]" />Profit</span>
            </div>
          </CardHeader>
          <CardContent>
            <FinancialsAreaChart data={monthlyFinancials} height={220} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
            <p className="mt-0.5 text-[10px] text-ink-faint">Current billing cycle</p>
          </CardHeader>
          <CardContent>
            <InvoiceDonutChart data={invoiceStatusBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* ── Projects + Profit Trend ── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Active Projects</CardTitle>
            <Link to="/projects" className="flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {topActiveProjects.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-ink-faint">No active projects yet.</p>
                <Link to="/projects">
                  <Button size="sm" variant="secondary" className="mt-3">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Create project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {topActiveProjects.map((project) => (
                  <div key={project.id} className="group">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{project.name}</p>
                        <p className="text-xs text-ink-faint">{project.client}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-medium tabular text-ink">{project.progress}%</span>
                        <p className="text-[10px] text-ink-faint">{formatCurrency(project.budget)}</p>
                      </div>
                    </div>
                    <div className="relative h-1 w-full rounded-full bg-[var(--color-edge)]">
                      <div
                        className="absolute left-0 top-0 h-1 rounded-full bg-[var(--color-accent)] transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
            <p className="mt-0.5 text-[10px] text-ink-faint">Last 12 months</p>
          </CardHeader>
          <CardContent>
            <ProfitLineChart data={monthlyFinancials} height={200} />
          </CardContent>
        </Card>
      </div>

      {/* ── Activity + Clients + Quick Actions ── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Activity Feed */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Activity</CardTitle>
            <Clock className="h-3.5 w-3.5 text-ink-faint" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="py-4 text-center text-xs text-ink-faint">No recent activity.</p>
              ) : activities.map((activity, i) => {
                const Icon = activityIconMap[activity.type as keyof typeof activityIconMap] || CheckSquare;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--color-edge)] bg-[var(--color-void)]">
                      <Icon className={`h-3 w-3 ${activityColorMap[activity.type as keyof typeof activityColorMap]}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-snug text-ink-dim">{activity.message}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-[10px] text-ink-faint">{activity.actor}</span>
                        <span className="text-[10px] text-ink-faint">·</span>
                        <span className="text-[10px] text-ink-faint">{timeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                    {i < activities.length - 1 && (
                      <div className="absolute left-[11px] top-6 h-3 w-px bg-[var(--color-edge)]" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Clients</CardTitle>
            <Link to="/clients" className="flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentClients.length === 0 ? (
              <p className="py-4 text-center text-xs text-ink-faint">No clients yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recentClients.map((client) => (
                  <div key={client.id} className="flex items-center gap-3 rounded-[var(--radius-control)] p-1.5 transition-colors hover:bg-[var(--color-charcoal)]">
                    <Avatar seed={client.avatarSeed} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-ink">{client.name}</p>
                      <p className="truncate text-[10px] text-ink-faint">{client.company}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs tabular text-ink-dim">{formatCurrency(client.totalValue)}</p>
                      <StatusBadge status={client.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {[
                { label: "Add Client",        icon: UserPlus,   to: "/clients",  desc: "Onboard a new client" },
                { label: "Create Invoice",    icon: FileText,   to: "/invoices", desc: "Bill for services" },
                { label: "New Project",       icon: FolderKanban, to: "/projects", desc: "Start tracking work" },
                { label: "Schedule Meeting",  icon: Calendar,   to: "/calendar", desc: "Block calendar time" },
                { label: "Add Task",          icon: CheckSquare, to: "/tasks",   desc: "Track a to-do" },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center gap-3 rounded-[var(--radius-control)] border border-transparent px-2.5 py-2 text-xs text-ink-dim transition-colors hover:border-[var(--color-edge)] hover:bg-[var(--color-charcoal)] hover:text-ink"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--color-edge)] bg-[var(--color-void)]">
                    <action.icon className="h-3 w-3 text-[var(--color-accent)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{action.label}</p>
                    <p className="text-[10px] text-ink-faint">{action.desc}</p>
                  </div>
                  <ArrowUpRight className="ml-auto h-3 w-3 text-ink-faint" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
