import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarPage() {
  const [monthOffset, setMonthOffset] = useState(0);
  const baseDate = new Date(2026, 5 + monthOffset, 1); // June 2026 = month index 5
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const monthLabel = baseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = 27; // current date context
  const isCurrentMonth = monthOffset === 0;

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*");
      if (error) throw error;
      return data as Task[];
    },
  });

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Schedule, milestones, and daily focus"
        actions={
          <Button className="bg-electric hover:bg-electric-deep text-white shadow-[0_4px_24px_rgba(37,99,235,0.4)] transition-all">
            <Plus className="h-4 w-4 mr-2" /> New Event
          </Button>
        }
      />

      <div className="glass-panel p-6 sm:p-8 rounded-[1.25rem] border-edge/30 relative overflow-hidden">
        {/* Subtle glowing background effect */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-electric/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="mb-8 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/10 border border-electric/20 text-electric shadow-[0_0_15px_rgba(37,99,235,0.15)]">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-semibold tracking-tight text-ink">{monthLabel}</p>
          </div>
          <div className="flex items-center gap-2 p-1 rounded-xl bg-charcoal/30 border border-edge/30 backdrop-blur-md">
            <Button variant="ghost" size="icon-sm" className="hover:bg-white/10 rounded-lg" onClick={() => setMonthOffset((m) => m - 1)}>
              <ChevronLeft className="h-4 w-4 text-ink-dim" />
            </Button>
            <Button variant="ghost" size="sm" className="text-xs font-medium text-ink-dim hover:text-ink hover:bg-white/10 rounded-lg px-4" onClick={() => setMonthOffset(0)}>
              Today
            </Button>
            <Button variant="ghost" size="icon-sm" className="hover:bg-white/10 rounded-lg" onClick={() => setMonthOffset((m) => m + 1)}>
              <ChevronRight className="h-4 w-4 text-ink-dim" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-edge/40 bg-edge/40 shadow-xl relative z-10">
          {WEEKDAYS.map((day) => (
            <div key={day} className="bg-graphite-soft/80 backdrop-blur-md px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-ink-faint">
              {day}
            </div>
          ))}
          {cells.map((day, i) => {
            const dayEvents = isCurrentMonth && day ? tasks.filter((t) => {
              const taskDate = new Date(t.dueDate);
              return taskDate.getDate() === day && taskDate.getMonth() === month && taskDate.getFullYear() === year;
            }) : [];
            const isToday = isCurrentMonth && day === today;
            const hasEvents = dayEvents.length > 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.005, duration: 0.2 }}
                className={cn(
                  "group min-h-[110px] bg-graphite/70 backdrop-blur-sm p-2 transition-all duration-300 relative",
                  day && "hover:bg-charcoal/60 hover:z-10 hover:shadow-2xl hover:scale-[1.02]",
                  !day && "bg-graphite/20 opacity-50"
                )}
              >
                {day && (
                  <>
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium tabular transition-all duration-300",
                        isToday ? "bg-electric text-white shadow-[0_0_16px_rgba(37,99,235,0.6)]" : 
                        hasEvents ? "text-ink group-hover:bg-white/10" : "text-ink-faint group-hover:text-ink-dim group-hover:bg-white/5"
                      )}
                    >
                      {day}
                    </span>
                    <div className="mt-2 flex flex-col gap-1.5">
                      <AnimatePresence>
                        {dayEvents.map((ev, evIndex) => {
                          const priorityConfig = {
                            low: { color: "bg-ink-faint", border: "border-ink-faint/30", text: "text-ink-dim" },
                            medium: { color: "bg-electric", border: "border-electric/30", text: "text-blue-100", glow: "shadow-[0_0_8px_rgba(37,99,235,0.4)]" },
                            high: { color: "bg-amber", border: "border-amber/30", text: "text-amber-100", glow: "shadow-[0_0_8px_rgba(245,158,11,0.4)]" },
                            urgent: { color: "bg-rose", border: "border-rose/30", text: "text-rose-100", glow: "shadow-[0_0_8px_rgba(239,68,68,0.4)]" },
                          }[ev.priority] || { color: "bg-electric", border: "border-electric/30", text: "text-blue-100" };
                          
                          return (
                            <motion.div
                              key={ev.id}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: evIndex * 0.1 }}
                              className={cn(
                                "flex items-center gap-1.5 rounded-md border bg-charcoal/40 backdrop-blur-md p-1.5 hover:bg-charcoal/80 transition-colors cursor-pointer",
                                priorityConfig.border
                              )}
                            >
                              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", priorityConfig.color, priorityConfig.glow)} />
                              <span className={cn("truncate text-[10px] font-medium leading-none", priorityConfig.text)}>{ev.title}</span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-[1.25rem] border-edge/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/10 border border-emerald/20 text-emerald">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="font-display text-base font-semibold text-ink">Upcoming this week</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tasks.slice(0, 4).map((task, i) => {
            const priorityColor = {
              low: "bg-ink-faint text-ink-faint border-ink-faint/20",
              medium: "bg-electric text-electric border-electric/20",
              high: "bg-amber text-amber border-amber/20",
              urgent: "bg-rose text-rose border-rose/20",
            }[task.priority] || "bg-electric text-electric border-electric/20";
            
            return (
              <motion.div 
                key={task.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-3 rounded-xl border border-edge/30 bg-charcoal/30 p-4 hover:bg-charcoal/50 hover:border-edge/60 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <span className={cn("h-2.5 w-2.5 rounded-full mt-1 shadow-sm", priorityColor.split(' ')[0])} />
                  <div className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-white/5", priorityColor.split(' ').slice(1).join(' '))}>
                    {task.priority}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink group-hover:text-white transition-colors">{task.title}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-ink-faint">
                    <Clock className="h-3 w-3" />
                    <span className="tabular">{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
