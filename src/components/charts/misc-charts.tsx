import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-2 text-xs shadow-[var(--shadow-dropdown)]">
      <p className="mb-1 font-medium text-ink">{label}</p>
      <p className="text-ink-dim">{payload[0].value} clients</p>
    </div>
  );
}

export function ClientGrowthChart({ data, height = 220 }: { data: { label: string; clients: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-ink-faint)", fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-ink-faint)", fontSize: 11 }} width={28} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="clients" fill="#2563EB" fillOpacity={0.8} radius={[3, 3, 0, 0]} animationDuration={700} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LeadConversionChart({ data, height = 220 }: { data: { label: string; value: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 6, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" horizontal={false} />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--color-ink-faint)", fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-ink-dim)", fontSize: 11 }}
          width={90}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          content={({ active, payload }: any) =>
            active && payload?.length ? (
              <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-2 text-xs shadow-[var(--shadow-dropdown)]">
                <p className="text-ink">{payload[0].payload.label}: <span className="tabular font-medium">{payload[0].value}</span></p>
              </div>
            ) : null
          }
        />
        <Bar dataKey="value" fill="#10B981" fillOpacity={0.8} radius={[0, 3, 3, 0]} animationDuration={700} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
