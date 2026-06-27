import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function GrowthTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg glass-panel-strong px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-ink">{label}</p>
      <p className="text-cyan">{payload[0].value} clients</p>
    </div>
  );
}

export function ClientGrowthChart({ data, height = 220 }: { data: { label: string; clients: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.25} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-ink-faint)", fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-ink-faint)", fontSize: 12 }} width={30} />
        <Tooltip content={<GrowthTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="clients" fill="url(#growthGradient)" radius={[6, 6, 0, 0]} animationDuration={900} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LeadConversionChart({ data, height = 220 }: { data: { label: string; value: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="funnelGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#a855f7" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" horizontal={false} />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--color-ink-faint)", fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-ink-dim)", fontSize: 12 }}
          width={90}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          content={({ active, payload }: any) =>
            active && payload?.length ? (
              <div className="rounded-lg glass-panel-strong px-3 py-2 text-xs shadow-lg">
                <p className="text-ink">{payload[0].payload.label}: {payload[0].value}</p>
              </div>
            ) : null
          }
        />
        <Bar dataKey="value" fill="url(#funnelGradient)" radius={[0, 6, 6, 0]} animationDuration={900} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
