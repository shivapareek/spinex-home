"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type RevenuePoint = { day: string; label: string; revenue: number; orders: number };

const rupee = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);
const compact = (v: number) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `₹${v}`);

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: RevenuePoint }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-3 text-ink shadow-soft">
      <p className="text-[11px] font-medium text-muted">{p.label}</p>
      <p className="mt-1 font-semibold text-xl">{rupee(p.revenue)}</p>
      <p className="text-[11px] text-muted">
        {p.orders} {p.orders === 1 ? "order" : "orders"}
      </p>
    </div>
  );
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const empty = data.every((d) => d.revenue === 0);
  return (
    <div className="relative h-[260px] w-full sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spxRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EA580C" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#EA580C" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#111111" strokeOpacity={0.06} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#111111", fillOpacity: 0.45, fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: "#111111", fillOpacity: 0.45, fontSize: 11 }}
            tickFormatter={compact}
            allowDecimals={false}
            domain={[0, empty ? 1000 : "auto"]}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#EA580C", strokeOpacity: 0.25, strokeDasharray: "4 4" }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#EA580C"
            strokeWidth={2}
            fill="url(#spxRevenueFill)"
            activeDot={{ r: 5, fill: "#EA580C", stroke: "#FFFFFF", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
      {empty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl bg-white/85 px-5 py-3 text-center ring-1 ring-line backdrop-blur">
            <p className="font-semibold text-lg text-ink">Awaiting your first sale</p>
            <p className="text-xs text-ink/50">Revenue will trace here day by day.</p>
          </div>
        </div>
      )}
    </div>
  );
}
