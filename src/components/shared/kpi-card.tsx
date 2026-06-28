import { useEffect, useState } from "react";
import { animate } from "framer-motion";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts/sparkline";

interface KPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change: number;
  icon: LucideIcon;
  accent?: "blue" | "green" | "amber" | "red";
  decimals?: number;
  sparklineData?: number[];
  secondaryLabel?: string;
}

const accentMap = {
  blue:  { text: "text-[#2563EB]", sparkColor: "#2563EB", bg: "bg-[rgba(37,99,235,0.1)]" },
  green: { text: "text-[#10B981]", sparkColor: "#10B981", bg: "bg-[rgba(16,185,129,0.1)]" },
  amber: { text: "text-[#F59E0B]", sparkColor: "#F59E0B", bg: "bg-[rgba(245,158,11,0.1)]" },
  red:   { text: "text-[#EF4444]", sparkColor: "#EF4444", bg: "bg-[rgba(239,68,68,0.1)]" },
};

export function KPICard({
  label,
  value,
  prefix = "",
  suffix = "",
  change,
  icon: Icon,
  accent = "blue",
  decimals = 0,
  sparklineData = [],
  secondaryLabel = "vs last month",
}: KPICardProps) {
  const [display, setDisplay] = useState(0);
  const isPositive = change >= 0;
  const colors = accentMap[accent];

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.0,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="group relative bg-[var(--color-card)] border border-[var(--color-edge)] rounded-[var(--radius-card)] p-4 transition-all duration-200 hover:border-[var(--color-edge-hover)] hover:bg-[var(--color-charcoal)]">
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink-faint uppercase tracking-wide">{label}</p>
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", colors.bg)}>
          <Icon className={cn("h-3.5 w-3.5", colors.text)} />
        </div>
      </div>

      {/* Value */}
      <p className="mt-2.5 font-display text-2xl font-semibold tracking-tight text-ink tabular">
        {prefix}
        {display.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {suffix}
      </p>

      {/* Sparkline + change */}
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="flex items-center gap-1 text-xs">
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-[#10B981]" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-[#EF4444]" />
          )}
          <span className={isPositive ? "text-[#10B981]" : "text-[#EF4444]"}>
            {isPositive ? "+" : ""}
            {change.toFixed(1)}%
          </span>
          <span className="text-ink-faint">{secondaryLabel}</span>
        </div>

        {sparklineData.length > 0 && (
          <div className="w-24 shrink-0">
            <Sparkline data={sparklineData} color={colors.sparkColor} height={32} />
          </div>
        )}
      </div>
    </div>
  );
}
