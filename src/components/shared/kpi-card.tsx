import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts/sparkline";
import { AnimatedCounter } from "@/components/premium/animated-counter";

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

import { memo } from "react";

export const KPICard = memo(function KPICard({
  label,
  value,
  prefix = "",
  suffix = "",
  change,
  icon: Icon,
  accent = "blue",
  sparklineData = [],
  secondaryLabel = "vs last month",
}: KPICardProps) {
  const isPositive = change >= 0;
  const colors = accentMap[accent];

  return (
    <div className="group relative bg-[var(--color-card)] border border-[var(--color-edge)] rounded-[var(--radius-card)] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--color-edge-hover)] hover:bg-[var(--color-charcoal)] overflow-hidden">
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between relative z-10">
        <p className="text-xs font-medium text-ink-faint uppercase tracking-wide">{label}</p>
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-md relative", colors.bg)}>
          <Icon className={cn("h-3.5 w-3.5", colors.text)} />
          <span className={cn("absolute -top-1 -right-1 h-2 w-2 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping", colors.bg.replace("0.1", "1"))} />
          <span className={cn("absolute -top-1 -right-1 h-2 w-2 rounded-full opacity-0 group-hover:opacity-100", colors.bg.replace("0.1", "1"))} />
        </div>
      </div>

      {/* Value */}
      <p className="mt-2.5 font-display text-2xl font-semibold tracking-tight text-ink tabular relative z-10">
        {prefix}
        <AnimatedCounter value={value} duration={1.5} />
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
});
