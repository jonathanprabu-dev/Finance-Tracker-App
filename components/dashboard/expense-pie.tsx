"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS } from "@/lib/constants";

type Slice = { category: string; amount: number };

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export function ExpensePie({ data }: { data: Slice[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No expenses this month.
      </div>
    );
  }
  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={240} className="max-w-[240px]">
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            innerRadius={56}
            outerRadius={90}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [fmt(Number(v)), String(name)]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              color: "var(--foreground)",
              fontSize: 13,
            }}
            labelStyle={{ color: "var(--foreground)" }}
            itemStyle={{ color: "var(--foreground)" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="w-full space-y-1.5">
        {data.map((d, i) => (
          <li key={d.category} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              {d.category}
            </span>
            <span className="font-mono text-muted-foreground">
              {((d.amount / total) * 100).toFixed(0)}% · {fmt(d.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
