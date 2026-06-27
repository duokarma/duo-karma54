import { useEffect, useRef, useState } from "react";
import { motion, animate } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change: number;
  icon: LucideIcon;
  accent?: "blue" | "violet" | "cyan" | "amber";
  decimals?: number;
}

const accentClasses: Record<string, string> = {
  blue: "from-electric/20 to-electric/5 text-electric",
  violet: "from-violet/20 to-violet/5 text-violet",
  cyan: "from-cyan/20 to-cyan/5 text-cyan",
  amber: "from-amber/20 to-amber/5 text-amber",
};

export function KPICard({ label, value, prefix = "", suffix = "", change, icon: Icon, accent = "blue", decimals = 0 }: KPICardProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const isPositive = change >= 0;

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Card className="group relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-0.5">
      <div className={cn("absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-opacity group-hover:opacity-90", accentClasses[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-faint">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink tabular">
            {prefix}
            <span ref={ref}>{display.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>
            {suffix}
          </p>
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br", accentClasses[accent])}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative mt-3 flex items-center gap-1 text-xs"
      >
        {isPositive ? (
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald" />
        ) : (
          <ArrowDownRight className="h-3.5 w-3.5 text-rose" />
        )}
        <span className={isPositive ? "text-emerald" : "text-rose"}>
          {isPositive ? "+" : ""}
          {change.toFixed(1)}%
        </span>
        <span className="text-ink-faint">vs last month</span>
      </motion.div>
    </Card>
  );
}
