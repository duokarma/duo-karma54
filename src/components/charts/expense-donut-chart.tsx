import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-2 text-xs shadow-[var(--shadow-dropdown)]">
      <p className="font-medium text-ink">{item.name}</p>
      <p className="text-ink-dim">{formatCurrency(item.value)}</p>
    </div>
  );
}

export function ExpenseDonutChart({ data, height = 240 }: { data: DonutDatum[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius="62%"
          outerRadius="90%"
          paddingAngle={3}
          cornerRadius={6}
          animationDuration={900}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
