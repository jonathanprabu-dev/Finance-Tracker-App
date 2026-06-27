"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { month: string; income: number; expenses: number };

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export function IncomeExpenseBar({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={288}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={fmt}
        />
        <Tooltip
          formatter={(v, name) => [fmt(Number(v)), name === "income" ? "Income" : "Expenses"]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            color: "var(--foreground)",
            fontSize: 13,
          }}
          labelStyle={{ color: "var(--foreground)" }}
          itemStyle={{ color: "var(--foreground)" }}
          cursor={{ fill: "var(--muted)" }}
        />
        <Legend
          formatter={(value) => (value === "income" ? "Income" : "Expenses")}
          wrapperStyle={{ fontSize: 13 }}
        />
        <Bar dataKey="income" fill="var(--positive)" radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Bar dataKey="expenses" fill="var(--negative)" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
