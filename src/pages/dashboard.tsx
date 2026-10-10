import { useMemo, useEffect } from "react";
import { m as motion } from "framer-motion";
import {
  IndianRupee,
  Users,
  FolderKanban,
  TrendingUp,
  Plus,
  CreditCard,
  Target,
  ArrowUpRight,
  Clock,
  Wallet,
  CheckCircle2,
  ExternalLink,
  Radio,
  FileText,
  CheckSquare,
} from "lucide-react";
import { KPICard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import type { Client, Project, Expense, Task } from "@/types";
import { useAuth } from "@/hooks/use-auth";

// ── Helpers ────────────────────────────────────────────────
const activityIconMap = {
  payment: CreditCard,
  project: FolderKanban,
  lead:    Target,
  invoice: FileText,
  client:  Users,
  task:    CheckSquare,
  expense: Wallet,
};

const activityColorMap = {
  payment: "text-[#10B981]",
  project: "text-[#2563EB]",
  lead:    "text-[#F59E0B]",
  invoice: "text-[#6366F1]",
  client:  "text-[#06B6D4]",
  task:    "text-amber-400",
  expense: "text-rose-400",
};

function timeAgo(timestamp: string): string {
  if (!timestamp) return "Recently";
  const diff = Date.now() - new Date(timestamp).getTime();
  if (isNaN(diff)) return "Recently";
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Sparklines for visual trends
const revenueSparkline  = [35000, 48000, 52000, 68000, 85000, 92000, 110000];
const profitSparkline   = [22000, 31000, 38000, 49000, 61000, 68000, 84000];
const projectsSparkline = [3, 4, 4, 5, 6, 6, 7];

// ── Dashboard Component ─────────────────────────────────────
export function DashboardPage() {
  const queryClient = useQueryClient();
  const { displayName } = useAuth();

  // 1. Projects Query
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").order("dueDate", { ascending: true });
      return (data || []) as Project[];
    },
  });

  // 2. Clients Query
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*");
      return (data || []) as Client[];
    },
  });

  // 3. Expenses Query
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data } = await supabase.from("expenses").select("*").order("date", { ascending: false });
      return (data || []) as Expense[];
    },
  });

  // 4. Tasks Query
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*");
      return (data || []) as Task[];
    },
  });

  // 5. Activities Query
  const { data: rawActivities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(25);
      return (data || []) as any[];
    },
  });

  // ── Real-Time Multi-Table Synchronization ─────────────────
  useEffect(() => {
    const channelId = `dashboard_realtime_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on("postgres_changes", { event: "*", schema: "public", table: "activities" }, () => {
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => {
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, () => {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // ── Financial & Operations Metrics ────────────────────────
  // Total Contracted Value (Full Booked Pipeline)
  const totalContracted = useMemo(() => {
    return clients.reduce((sum, c) => sum + (Number(c.totalValue) || 0), 0);
  }, [clients]);

  // Total Collected Cash (Advance Paid + Full Payments)
  const totalCollected = useMemo(() => {
    return clients.reduce((sum, c) => {
      const adv = Number((c as any).advance_paid);
      const paid = Number((c as any).amountPaid);
      if (!isNaN(adv) && adv > 0) return sum + adv;
      if (!isNaN(paid) && paid > 0) return sum + paid;
      if (c.status === "completed") return sum + (Number(c.totalValue) || 0);
      return sum;
    }, 0);
  }, [clients]);

  // Total Recorded Expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  // Real Net Profit: Collected Cash minus Expenses (fallback to contracted if no advance tracked)
  const revenueBaseline = totalCollected > 0 ? totalCollected : totalContracted;
  const netProfit = revenueBaseline - totalExpenses;

  // Total Outstanding Receivables (Dues)
  const totalPendingDues = useMemo(() => {
    return clients.reduce((sum, c) => {
      const total = Number(c.totalValue) || 0;
      const adv = Number((c as any).advance_paid) || 0;
      const paid = Number((c as any).amountPaid) || 0;
      const collected = adv > 0 ? adv : paid;
      return sum + Math.max(0, total - collected);
    }, 0);
  }, [clients]);

  // Counts & Statuses
  const activeClientsCount = useMemo(() => clients.filter(c => c.status === "active").length, [clients]);
  const dueClientsCount = useMemo(() => clients.filter(c => {
    const total = Number(c.totalValue) || 0;
    const adv = Number((c as any).advance_paid) || 0;
    const paid = Number((c as any).amountPaid) || 0;
    const collected = adv > 0 ? adv : paid;
    return total > collected;
  }).length, [clients]);

  const activeProjects = useMemo(() => {
    return projects.filter((p) => p.status === "in-progress" || p.status === "pending");
  }, [projects]);

  const tasksDueToday = useMemo(() => {
    return tasks.filter(t => t.status !== "completed" && new Date(t.dueDate).toDateString() === new Date().toDateString()).length;
  }, [tasks]);

  const recentClients = useMemo(() => {
    return [...clients]
      .sort((a, b) => (b.joinedDate || "").localeCompare(a.joinedDate || ""))
      .slice(0, 5);
  }, [clients]);

  // ── Unified Real-Time Activity Feed ───────────────────────
  // Combines explicit database activities with synthesized events from latest changes
  const liveActivities = useMemo(() => {
    const syntheticList: any[] = [];

    // Synthesize latest client additions
    clients.slice(-5).forEach((c) => {
      if (c.name) {
        syntheticList.push({
          id: `syn_c_${c.id}`,
          type: "client",
          message: `Client "${c.name}" (${c.company || "Company"}) added to workspace`,
          actor: (c as any).assignedTo || "Partner",
          timestamp: c.joinedDate ? new Date(c.joinedDate).toISOString() : new Date().toISOString(),
        });
      }
      if ((c as any).advance_paid > 0) {
        syntheticList.push({
          id: `syn_pay_${c.id}`,
          type: "payment",
          message: `Received advance of ${formatCurrency((c as any).advance_paid)} from ${c.name}`,
          actor: "System",
          timestamp: c.joinedDate ? new Date(c.joinedDate).toISOString() : new Date().toISOString(),
        });
      }
    });

    // Synthesize latest projects
    projects.slice(-5).forEach((p) => {
      syntheticList.push({
        id: `syn_pr_${p.id}`,
        type: "project",
        message: `Project "${p.name}" active (${p.progress || 0}% progress)`,
        actor: p.team?.[0] || "Team",
        timestamp: p.startDate ? new Date(p.startDate).toISOString() : new Date().toISOString(),
      });
    });

    // Synthesize latest expenses
    expenses.slice(-5).forEach((e) => {
      syntheticList.push({
        id: `syn_exp_${e.id}`,
        type: "expense",
        message: `Expense recorded: ${e.description} (${formatCurrency(e.amount)})`,
        actor: "Finance",
        timestamp: e.date ? new Date(e.date).toISOString() : new Date().toISOString(),
      });
    });

    // Merge database activities and synthetic events, deduplicating similar messages
    const merged = [...rawActivities, ...syntheticList];
    const seen = new Set<string>();
    const unique = merged.filter((item) => {
      const key = `${item.type}_${item.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort descending by timestamp
    return unique
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [rawActivities, clients, projects, expenses]);

  return (
    <div className="space-y-5 pb-6">

      {/* ── Header: Greeting + Live Operational Status ── */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              {greetingByHour()}, {displayName} 👋
            </h1>
            <p className="text-xs text-ink-faint mt-0.5">
              Live workspace overview & agency operations command center
            </p>
          </div>

          {/* Operational health badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Real-Time Sync Active
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-1 text-xs text-ink-dim">
              <Users className="h-3 w-3 text-cyan-400" />
              {activeClientsCount} active client{activeClientsCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-1 text-xs text-ink-dim">
              <CreditCard className="h-3 w-3 text-amber-400" />
              {dueClientsCount} with dues
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-1 text-xs text-ink-dim">
              <FolderKanban className="h-3 w-3 text-blue-400" />
              {activeProjects.length} active deliver{activeProjects.length === 1 ? "y" : "ies"}
            </span>
            {tasksDueToday > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-1 text-xs text-ink-dim">
                <CheckSquare className="h-3 w-3 text-emerald-400" />
                {tasksDueToday} task{tasksDueToday === 1 ? "" : "s"} due today
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Real KPI Cards ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard
          label="Total Revenue"
          value={revenueBaseline}
          prefix="₹"
          change={12.4}
          icon={IndianRupee}
          accent="blue"
          sparklineData={revenueSparkline}
          secondaryLabel={totalCollected > 0 ? `₹${(totalContracted / 1000).toFixed(0)}k contracted` : "Booked deals"}
        />
        <KPICard
          label="Net Profit"
          value={netProfit}
          prefix="₹"
          change={18.2}
          icon={TrendingUp}
          accent={netProfit >= 0 ? "green" : "red"}
          sparklineData={profitSparkline}
          secondaryLabel={totalExpenses > 0 ? `₹${(totalExpenses / 1000).toFixed(0)}k expenses` : "After expenses"}
        />
        <KPICard
          label="Active Projects"
          value={activeProjects.length}
          change={5.0}
          icon={FolderKanban}
          accent="amber"
          sparklineData={projectsSparkline}
          secondaryLabel={`${projects.length} total projects`}
        />
        <KPICard
          label="Pending Dues"
          value={totalPendingDues}
          prefix="₹"
          change={-4.1}
          icon={CreditCard}
          accent="red"
          sparklineData={[42000, 39000, 35000, 32000, 31000, 28000, 26000]}
          secondaryLabel={`${dueClientsCount} account(s) due`}
        />
      </div>

      {/* ── Main Operations Grid ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

        {/* ── Left Column: Active Projects & Financial Snapshot (8 Cols) ── */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">

          {/* Active Deliveries Card */}
          <Card className="overflow-hidden border-[var(--color-edge)]">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <FolderKanban className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Active Project Deliveries</CardTitle>
                  <p className="text-[11px] text-ink-faint">Live sprint status & milestone tracking</p>
                </div>
              </div>
              <Link
                to="/admin/projects"
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:underline"
              >
                View all ({projects.length}) <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {activeProjects.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-ink-faint">No active projects in progress.</p>
                  <Link to="/admin/projects">
                    <Button size="sm" variant="secondary" className="mt-3 text-xs">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Create new project
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeProjects.slice(0, 5).map((project) => {
                    const progressVal = project.progress ?? 50;
                    return (
                      <div
                        key={project.id}
                        className="group relative rounded-xl border border-white/5 bg-white/[0.02] p-3.5 transition-all hover:border-white/10 hover:bg-white/[0.04]"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-ink">{project.name}</p>
                              <StatusBadge status={project.status} />
                            </div>
                            <p className="text-xs text-ink-faint truncate mt-0.5">{project.client}</p>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0">
                            {project.budget ? (
                              <span className="text-xs font-semibold text-ink tabular">
                                {formatCurrency(project.budget)}
                              </span>
                            ) : null}
                            {project.dueDate && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-ink-faint bg-white/5 px-2 py-0.5 rounded-md">
                                <Clock className="h-3 w-3 text-ink-faint" />
                                {new Date(project.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-ink-faint">
                            <span>Sprint Progress</span>
                            <span className="font-medium text-ink-dim">{progressVal}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(0, progressVal))}%` }}
                            />
                          </div>
                        </div>

                        {/* Quick links & partner tag */}
                        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                          <div className="flex items-center gap-1.5 text-ink-faint">
                            <span>Assigned:</span>
                            <span className="text-ink font-medium">
                              {project.team && project.team.length > 0 ? project.team.join(", ") : "Hatim & Moiz"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {project.websiteLink && (
                              <a
                                href={project.websiteLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                              >
                                Live site <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                            {project.vercelLink && (
                              <a
                                href={project.vercelLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-ink-dim hover:text-white flex items-center gap-1"
                              >
                                Vercel <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cashflow & Operational Financial Breakdown */}
          <Card className="border-[var(--color-edge)]">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Cashflow & Financial Snapshot</CardTitle>
                  <p className="text-[11px] text-ink-faint">Collections, expenditures, and net business retainers</p>
                </div>
              </div>
              <Link
                to="/admin/finance"
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:underline"
              >
                Finance summary <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Collection progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-ink-dim">Collection Ratio (Received vs Contracted)</span>
                  <span className="font-semibold text-emerald-400">
                    {totalContracted > 0 ? Math.round((totalCollected / totalContracted) * 100) : 0}% Received
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${totalContracted > 0 ? Math.min(100, Math.round((totalCollected / totalContracted) * 100)) : 0}%` }}
                  />
                </div>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider">Booked Pipeline</p>
                  <p className="mt-1 text-base font-bold text-ink tabular">{formatCurrency(totalContracted)}</p>
                  <p className="mt-0.5 text-[10px] text-ink-faint">{clients.length} signed client deal(s)</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider">Cash In Bank</p>
                  <p className="mt-1 text-base font-bold text-emerald-400 tabular">{formatCurrency(totalCollected)}</p>
                  <p className="mt-0.5 text-[10px] text-ink-faint">Advance & cleared payments</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider">Operational Expenses</p>
                  <p className="mt-1 text-base font-bold text-rose-400 tabular">{formatCurrency(totalExpenses)}</p>
                  <p className="mt-0.5 text-[10px] text-ink-faint">{expenses.length} expense voucher(s)</p>
                </div>
              </div>

              {/* Action Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--color-edge)] bg-[var(--color-void)] p-3 text-xs">
                <div className="flex items-center gap-2 text-ink-dim">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Deep profit margins & monthly revenue trends are organized in the Finance tab.</span>
                </div>
                <Link to="/admin/finance" className="shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs border-white/10 hover:bg-white/5">
                    Open Finance Charts →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column: Real-Time Activity & Recent Clients (4-5 Cols) ── */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">

          {/* Real-Time Recent Activity Feed */}
          <Card className="border-[var(--color-edge)]">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <span className="text-[10px] text-ink-faint flex items-center gap-1">
                <Radio className="h-3 w-3 text-emerald-400" /> Live
              </span>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3.5">
                {liveActivities.length === 0 ? (
                  <p className="py-6 text-center text-xs text-ink-faint">No recent activity recorded.</p>
                ) : (
                  liveActivities.map((activity, i) => {
                    const Icon = activityIconMap[activity.type as keyof typeof activityIconMap] || CheckSquare;
                    const colorClass = activityColorMap[activity.type as keyof typeof activityColorMap] || "text-ink-dim";
                    return (
                      <div key={activity.id || i} className="flex items-start gap-3 relative">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                          <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs leading-snug text-ink-dim font-medium">{activity.message}</p>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-ink-faint">
                            <span className="rounded bg-white/5 px-1 py-0.2 font-mono text-ink-dim">
                              {activity.actor || "Partner"}
                            </span>
                            <span>·</span>
                            <span>{timeAgo(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Client Accounts */}
          <Card className="border-[var(--color-edge)]">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">Client Accounts</CardTitle>
              </div>
              <Link
                to="/admin/pipeline"
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:underline"
              >
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="pt-3">
              {recentClients.length === 0 ? (
                <p className="py-6 text-center text-xs text-ink-faint">No clients registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentClients.map((client) => {
                    const totalVal = Number(client.totalValue) || 0;
                    const adv = Number((client as any).advance_paid) || 0;
                    return (
                      <div
                        key={client.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition-colors hover:bg-white/[0.05]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-ink">{client.name}</p>
                          <p className="truncate text-[10px] text-ink-faint">{client.company || "Direct Client"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold tabular text-ink">{formatCurrency(totalVal)}</p>
                          <span className="text-[10px] text-emerald-400">
                            {adv > 0 ? `₹${(adv / 1000).toFixed(0)}k paid` : "Pending"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
