import { useState, useEffect } from "react";
import { Clock, CheckSquare, Activity, Pin, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-void)] p-4 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent)]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        <Clock className="h-5 w-5 text-ink-dim" />
      </div>
      <div>
        <p className="text-xl font-semibold text-ink tabular-nums tracking-tight">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
        <p className="text-xs text-ink-faint">
          {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}

export function QuickNotes() {
  const [note, setNote] = useState(() => localStorage.getItem("quick-note") || "");

  useEffect(() => {
    const debounce = setTimeout(() => {
      localStorage.setItem("quick-note", note);
    }, 500);
    return () => clearTimeout(debounce);
  }, [note]);

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] p-4 shadow-sm flex flex-col h-40 group">
      <div className="flex items-center gap-2 mb-2">
        <CheckSquare className="h-4 w-4 text-ink-faint" />
        <h3 className="text-sm font-medium text-ink">Scratchpad</h3>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Jot down a quick thought..."
        className="flex-1 bg-transparent resize-none text-xs text-ink placeholder:text-ink-faint outline-none scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      />
    </div>
  );
}

export function ServerStatus() {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-ink-faint" />
          <h3 className="text-sm font-medium text-ink">System Status</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-medium text-emerald-500">Operational</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-faint">API Gateway</span>
          <span className="text-ink">14ms</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-faint">Database</span>
          <span className="text-ink">4ms</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-faint">Storage</span>
          <span className="text-ink">28ms</span>
        </div>
      </div>
    </div>
  );
}

export function PinnedProjects() {
  const projects = [
    { name: "Alpha Redesign", client: "Acme Corp", progress: 75 },
    { name: "Beta Dashboard", client: "Globex", progress: 30 },
  ];

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Pin className="h-4 w-4 text-ink-faint" />
        <h3 className="text-sm font-medium text-ink">Pinned Projects</h3>
      </div>
      
      <div className="space-y-3">
        {projects.map((p, i) => (
          <Link key={i} to="/admin/projects" className="block group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-ink group-hover:text-[var(--color-accent)] transition-colors">{p.name}</span>
              <ArrowUpRight className="h-3 w-3 text-ink-faint group-hover:text-[var(--color-accent)] transition-colors" />
            </div>
            <div className="relative h-1 w-full rounded-full bg-[var(--color-edge)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${p.progress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                className="absolute left-0 top-0 h-1 rounded-full bg-[var(--color-accent)]"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
