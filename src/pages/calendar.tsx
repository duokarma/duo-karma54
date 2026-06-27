import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalEvent {
  day: number;
  title: string;
  color: string;
  time: string;
}

const events: CalEvent[] = [
  { day: 2, title: "Kickoff — Lumen Health", color: "bg-electric", time: "10:00 AM" },
  { day: 5, title: "Invoice review", color: "bg-amber", time: "2:00 PM" },
  { day: 9, title: "Northwind sync", color: "bg-violet", time: "11:30 AM" },
  { day: 9, title: "Design crit", color: "bg-cyan", time: "4:00 PM" },
  { day: 14, title: "Kintsugi QA demo", color: "bg-rose", time: "9:00 AM" },
  { day: 18, title: "Marbella reservation demo", color: "bg-electric", time: "1:00 PM" },
  { day: 22, title: "Monthly close prep", color: "bg-amber", time: "3:00 PM" },
  { day: 27, title: "Team retro", color: "bg-emerald", time: "5:00 PM" },
  { day: 27, title: "Northwind portfolio review", color: "bg-violet", time: "11:00 AM" },
];

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
            const dayEvents = isCurrentMonth && day ? events.filter((e) => e.day === day) : [];
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
                        isToday ? "bg-gradient-to-br from-electric to-indigo text-white" : "text-ink-dim"
                      )}
                    >
                      {day}
                    </span>
                    <div className="mt-1.5 space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.title}
                          className="truncate rounded px-1.5 py-0.5 text-[10px] text-white"
                          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                        >
                          <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full", event.color)} />
                          <span className="text-ink-dim">{event.title}</span>
                        </div>
                      ))}
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
          {events.slice(0, 4).map((event) => (
            <div key={event.title} className="flex items-center gap-3">
              <span className={cn("h-2 w-2 rounded-full", event.color)} />
              <div className="flex-1">
                <p className="text-sm text-ink-dim">{event.title}</p>
              </div>
              <span className="text-xs text-ink-faint tabular">{event.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
