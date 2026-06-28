import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div>
      <PageHeader
        title="Calendar"
        description="Upcoming meetings, deadlines, and reminders"
        actions={
          <Button>
            <Plus className="h-4 w-4" /> New Event
          </Button>
        }
      />

      <Card className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <p className="font-display text-lg font-semibold text-ink">{monthLabel}</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => setMonthOffset((m) => m - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setMonthOffset(0)}>
              Today
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setMonthOffset((m) => m + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[var(--radius-card)] border border-edge bg-edge">
          {WEEKDAYS.map((day) => (
            <div key={day} className="bg-graphite-soft px-2 py-2 text-center text-xs font-medium text-ink-faint">
              {day}
            </div>
          ))}
          {cells.map((day, i) => {
            const dayEvents = isCurrentMonth && day ? tasks.filter((t) => {
              const taskDate = new Date(t.dueDate);
              return taskDate.getDate() === day && taskDate.getMonth() === month && taskDate.getFullYear() === year;
            }) : [];
            const isToday = isCurrentMonth && day === today;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
                className={cn(
                  "min-h-[90px] bg-graphite p-2 transition-colors",
                  day && "hover:bg-charcoal-soft",
                  !day && "bg-graphite/40"
                )}
              >
                {day && (
                  <>
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs tabular",
                        isToday ? "bg-electric text-white font-medium shadow-sm" : "text-ink-faint"
                      )}
                    >
                      {day}
                    </span>
                    <div className="mt-1 flex flex-col gap-1">
                      {dayEvents.map((ev) => {
                        const priorityColor = {
                          low: "bg-ink-faint",
                          medium: "bg-electric",
                          high: "bg-amber",
                          urgent: "bg-rose",
                        }[ev.priority] || "bg-electric";
                        
                        return (
                          <div
                            key={ev.id}
                            className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-edge/50 bg-charcoal p-1 shadow-sm"
                          >
                            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", priorityColor)} />
                            <span className="truncate text-[10px] font-medium text-ink leading-none">{ev.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>

      <Card className="mt-5 p-5">
        <p className="mb-4 font-display text-sm font-medium text-ink">Upcoming this week</p>
        <div className="space-y-3">
          {tasks.slice(0, 4).map((task) => {
            const priorityColor = {
              low: "bg-ink-faint",
              medium: "bg-electric",
              high: "bg-amber",
              urgent: "bg-rose",
            }[task.priority] || "bg-electric";
            
            return (
              <div key={task.id} className="flex items-center gap-3">
                <span className={cn("h-2 w-2 rounded-full", priorityColor)} />
                <div className="flex-1">
                  <p className="text-sm text-ink-dim">{task.title}</p>
                </div>
                <span className="text-xs text-ink-faint tabular">
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
