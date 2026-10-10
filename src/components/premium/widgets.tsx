import { useState, useEffect, useCallback } from "react";
import {
  Clock, CheckSquare, Activity, Pin, ArrowUpRight,
  IndianRupee, Users, Target, Zap, Database, Server,
  TrendingUp, AlertCircle, CheckCircle2, Loader2,
  Briefcase,
} from "lucide-react";
import { Link } from "react-router-dom";
import { m as motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

// ── Live Clock ────────────────────────────────────────────────────────────────
export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-void)] p-4 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent)]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        <Clock className="h-5 w-5 text-ink-dim" />
      </div>
      <div>
        <p className="text-xl font-semibold text-ink tabular-nums tracking-tight">
          {time.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
        <p className="text-[10px] text-ink-faint">
          {greeting} · {time.toLocaleDateString("en-IN", { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}

// ── Quick Actions ─────────────────────────────────────────────────────────────
export function QuickActions({ onClose }: { onClose?: () => void }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] p-3 shadow-sm">
      <p className="text-[11px] font-medium text-ink-faint mb-2">Quick Navigation</p>
      <div className="grid grid-cols-2 gap-1.5">
        <Link
          to="/admin/leads"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/2 hover:bg-white/6 px-2.5 py-1.5 text-xs text-ink transition-colors group"
        >
          <Target className="h-3.5 w-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="truncate">Pipeline Leads</span>
        </Link>
        <Link
          to="/admin/projects"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/2 hover:bg-white/6 px-2.5 py-1.5 text-xs text-ink transition-colors group"
        >
          <Briefcase className="h-3.5 w-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="truncate">Projects</span>
        </Link>
        <Link
          to="/admin/revenue"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/2 hover:bg-white/6 px-2.5 py-1.5 text-xs text-ink transition-colors group"
        >
          <IndianRupee className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="truncate">Finance & GST</span>
        </Link>
        <Link
          to="/admin/clients"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/2 hover:bg-white/6 px-2.5 py-1.5 text-xs text-ink transition-colors group"
        >
          <Users className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="truncate">Clients</span>
        </Link>
      </div>
    </div>
  );
}

// ── Quick Notes / Scratchpad ──────────────────────────────────────────────────
export function QuickNotes() {
  const [note, setNote] = useState(() => localStorage.getItem("quick-note") || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const debounce = setTimeout(() => {
      localStorage.setItem("quick-note", note);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    }, 600);
    return () => clearTimeout(debounce);
  }, [note]);

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] p-4 shadow-sm flex flex-col h-36 group">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-ink-faint" />
          <h3 className="text-sm font-medium text-ink">Scratchpad</h3>
        </div>
        {saved && (
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Saved
          </span>
        )}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Jot down a quick thought, task, or reminder..."
        className="flex-1 bg-transparent resize-none text-xs text-ink placeholder:text-ink-faint outline-none scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent leading-relaxed"
      />
    </div>
  );
}

// ── Business KPIs (100% Real Live Data from Supabase) ─────────────────────────
export function BusinessKPIs() {
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("totalValue, advance_paid, remaining_amount, status");
      return data ?? [];
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("stage, value");
      return data ?? [];
    },
  });

  const totalRevenue = clients.reduce((s: number, c: any) => s + (c.totalValue ?? 0), 0);
  const totalReceived = clients.reduce((s: number, c: any) => s + (c.advance_paid ?? 0), 0);
  const totalPending = clients.reduce((s: number, c: any) => s + Math.max(0, (c.totalValue ?? 0) - (c.advance_paid ?? 0)), 0);
  const activeClients = clients.filter((c: any) => c.status === "active").length;
  const totalLeads = leads.length;
  const wonLeads = leads.filter((l: any) => l.stage === "won").length;

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-ink-faint" />
        <h3 className="text-sm font-medium text-ink">Business Overview</h3>
        <span className="ml-auto text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Supabase
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-emerald-500/8 border border-emerald-500/20 p-2.5">
          <p className="text-[10px] text-emerald-400/70 mb-0.5 flex items-center gap-1">
            <IndianRupee className="h-2.5 w-2.5" /> Total Contracted
          </p>
          <p className="text-sm font-bold text-emerald-400 tabular-nums">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-lg bg-blue-500/8 border border-blue-500/20 p-2.5">
          <p className="text-[10px] text-blue-400/70 mb-0.5 flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" /> Received
          </p>
          <p className="text-sm font-bold text-blue-400 tabular-nums">{formatCurrency(totalReceived)}</p>
        </div>
        <div className="rounded-lg bg-amber-500/8 border border-amber-500/20 p-2.5">
          <p className="text-[10px] text-amber-400/70 mb-0.5 flex items-center gap-1">
            <AlertCircle className="h-2.5 w-2.5" /> Due / Pending
          </p>
          <p className="text-sm font-bold text-amber-400 tabular-nums">{formatCurrency(totalPending)}</p>
        </div>
        <div className="rounded-lg bg-violet-500/8 border border-violet-500/20 p-2.5">
          <p className="text-[10px] text-violet-400/70 mb-0.5 flex items-center gap-1">
            <Users className="h-2.5 w-2.5" /> Active Clients
          </p>
          <p className="text-sm font-bold text-violet-400">{activeClients} clients</p>
        </div>
        <div className="col-span-2 rounded-lg bg-white/3 border border-white/8 p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-ink-faint" />
            <span className="text-xs text-ink-faint">Pipeline Leads</span>
          </div>
          <span className="text-xs font-semibold text-ink">
            {totalLeads} total · <span className="text-emerald-400">{wonLeads} won</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Pinned Projects (100% Real Live Data from Supabase) ───────────────────────
export function PinnedProjects({ onClose }: { onClose?: () => void }) {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, name, client, progress, status, priority, dueDate")
        .in("status", ["in-progress", "pending"])
        .order("priority", { ascending: false })
        .limit(4);
      return data ?? [];
    },
  });

  const statusColor: Record<string, string> = {
    "in-progress": "bg-blue-500",
    "pending": "bg-amber-500",
    "completed": "bg-emerald-500",
    "on-hold": "bg-slate-500",
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-ink-faint" />
          <h3 className="text-sm font-medium text-ink">Active Projects</h3>
        </div>
        <Link to="/admin/projects" onClick={onClose} className="text-[10px] text-[var(--color-accent)] hover:underline">
          See all
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />
        </div>
      ) : projects.length === 0 ? (
        <p className="text-xs text-ink-faint text-center py-4">No active projects</p>
      ) : (
        <div className="space-y-3">
          {(projects as any[]).map((p, i) => (
            <Link key={p.id} to="/admin/projects" onClick={onClose} className="block group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusColor[p.status] ?? "bg-white/30"}`}
                  />
                  <span className="text-xs font-medium text-ink truncate group-hover:text-[var(--color-accent)] transition-colors">
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-ink-faint">{p.progress ?? 0}%</span>
                  <ArrowUpRight className="h-3 w-3 text-ink-faint group-hover:text-[var(--color-accent)] transition-colors" />
                </div>
              </div>
              <p className="text-[10px] text-ink-faint mb-1">{p.client}</p>
              <div className="relative h-1 w-full rounded-full bg-[var(--color-edge)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, p.progress ?? 0)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                  className="absolute left-0 top-0 h-1 rounded-full bg-[var(--color-accent)]"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Upcoming Priority Tasks (100% Real Live Data from Supabase) ───────────────
export function UpcomingTasks({ onClose }: { onClose?: () => void }) {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", "widget"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("id, title, project, assignee, priority, status, dueDate")
        .neq("status", "completed")
        .order("dueDate", { ascending: true })
        .limit(3);
      return data ?? [];
    },
  });

  const priorityColor: Record<string, string> = {
    urgent: "text-rose-400 bg-rose-500/10 border-rose-500/25",
    high: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    medium: "text-blue-400 bg-blue-500/10 border-blue-500/25",
    low: "text-ink-faint bg-white/5 border-white/10",
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-ink-faint" />
          <h3 className="text-sm font-medium text-ink">Priority Tasks</h3>
        </div>
        <Link to="/admin/tasks" onClick={onClose} className="text-[10px] text-[var(--color-accent)] hover:underline">
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-xs text-ink-faint text-center py-3">All tasks completed! 🎉</p>
      ) : (
        <div className="space-y-2">
          {(tasks as any[]).map((t) => (
            <Link
              key={t.id}
              to="/admin/tasks"
              onClick={onClose}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/2 p-2 hover:bg-white/6 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-ink truncate group-hover:text-[var(--color-accent)] transition-colors">
                  {t.title}
                </p>
                <p className="text-[10px] text-ink-faint truncate">
                  {t.project ? `${t.project} · ` : ""}{t.assignee || "Unassigned"}
                </p>
              </div>
              <span
                className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                  priorityColor[t.priority] ?? priorityColor.medium
                }`}
              >
                {t.priority}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Server & Cloud Status (100% Real Live Network Latencies) ──────────────────
export function ServerStatus() {
  const [latencies, setLatencies] = useState<{
    supabase: number | null;
    storage: number | null;
  }>({ supabase: null, storage: null });
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const pingServices = useCallback(async () => {
    setChecking(true);
    try {
      // Real DB ping against Supabase REST endpoint
      const dbStart = performance.now();
      await supabase.from("clients").select("id").limit(1);
      const dbMs = Math.round(performance.now() - dbStart);

      // Real storage bucket ping
      const stStart = performance.now();
      await supabase.storage.listBuckets();
      const stMs = Math.round(performance.now() - stStart);

      setLatencies({ supabase: dbMs, storage: stMs });
      setLastChecked(new Date());
    } catch {
      setLatencies({ supabase: null, storage: null });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    pingServices();
    const interval = setInterval(pingServices, 30_000); // Live re-check every 30s
    return () => clearInterval(interval);
  }, [pingServices]);

  function latencyColor(ms: number | null) {
    if (ms === null) return "text-red-400";
    if (ms < 200) return "text-emerald-400";
    if (ms < 600) return "text-amber-400";
    return "text-red-400";
  }

  function latencyBg(ms: number | null) {
    if (ms === null) return "bg-red-500";
    if (ms < 200) return "bg-emerald-500";
    if (ms < 600) return "bg-amber-500";
    return "bg-red-500";
  }

  const allOk = latencies.supabase !== null && latencies.storage !== null;
  const avgMs = allOk
    ? Math.round(((latencies.supabase ?? 0) + (latencies.storage ?? 0)) / 2)
    : null;

  const rows = [
    { label: "Supabase Database", icon: Database, ms: latencies.supabase },
    { label: "Storage Buckets", icon: Server, ms: latencies.storage },
    { label: "Avg Live Ping", icon: Zap, ms: avgMs },
  ];

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-ink-faint" />
          <h3 className="text-sm font-medium text-ink">System Status</h3>
        </div>
        <div className="flex items-center gap-2">
          {checking ? (
            <Loader2 className="h-3 w-3 animate-spin text-ink-faint" />
          ) : (
            <button
              onClick={pingServices}
              className="text-[11px] text-ink-faint hover:text-ink transition-colors px-1 rounded border border-white/10 hover:bg-white/5"
              title="Measure live ping now"
            >
              ↻ Ping
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${allOk ? "bg-emerald-400" : "bg-red-400"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${allOk ? "bg-emerald-500" : "bg-red-500"}`} />
            </span>
            <span className={`text-[10px] font-semibold ${allOk ? "text-emerald-400" : "text-red-400"}`}>
              {allOk ? "Operational" : "Checking…"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {rows.map(({ label, icon: Icon, ms }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-ink-faint">
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </div>
            <div className="flex items-center gap-2">
              {ms !== null && (
                <div className="h-1.5 w-14 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${latencyBg(ms)} transition-all duration-300`}
                    style={{ width: `${Math.min(100, Math.max(15, (ms / 600) * 100))}%` }}
                  />
                </div>
              )}
              <span className={`font-mono tabular-nums font-semibold ${latencyColor(ms)} text-xs min-w-[42px] text-right`}>
                {ms !== null ? `${ms}ms` : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {lastChecked && (
        <p className="mt-3 text-[10px] text-ink-faint text-right border-t border-white/5 pt-2">
          Verified live at {lastChecked.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </p>
      )}
    </div>
  );
}
