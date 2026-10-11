"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type RevenuePoint = { day: string; label: string; revenue: number; orders: number };

const rupee = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);
const compact = (v: number) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `₹${v}`);

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: RevenuePoint }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-2xl bg-ink px-4 py-3 text-ivory shadow-lift">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-bright/80">{p.label}</p>
      <p className="mt-1 font-display text-xl">{rupee(p.revenue)}</p>
      <p className="text-[11px] text-ivory/55">
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
              <stop offset="0%" stopColor="#C9A24A" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#C9A24A" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#140A0C" strokeOpacity={0.06} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#140A0C", fillOpacity: 0.45, fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: "#140A0C", fillOpacity: 0.45, fontSize: 11 }}
            tickFormatter={compact}
            allowDecimals={false}
            domain={[0, empty ? 1000 : "auto"]}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#5E1224", strokeOpacity: 0.25, strokeDasharray: "4 4" }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#5E1224"
            strokeWidth={2}
            fill="url(#spxRevenueFill)"
            activeDot={{ r: 5, fill: "#5E1224", stroke: "#F7F0E3", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
      {empty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl bg-white/85 px-5 py-3 text-center ring-1 ring-ink/[0.06] backdrop-blur">
            <p className="font-display text-lg text-ink">Awaiting your first sale</p>
            <p className="text-xs text-ink/50">Revenue will trace here day by day.</p>
          </div>
        </div>
      )}
    </div>
  );
}
