"use server";

import { prisma } from "@/lib/prisma";
import { getTotals } from "@/lib/finance";
import { toNumber } from "@/lib/money";

// Upsert today's net-worth snapshot (one row per day). Called on dashboard
// load and after a price refresh so the trend chart always has a fresh point.
export async function recordSnapshot() {
  const { cash, stockValue, totalDebt, netWorth } = await getTotals();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.netWorthSnapshot.upsert({
    where: { date: today },
    update: {
      cash: cash.toString(),
      stockValue: stockValue.toString(),
      liabilities: totalDebt.toString(),
      netWorth: netWorth.toString(),
    },
    create: {
      date: today,
      cash: cash.toString(),
      stockValue: stockValue.toString(),
      liabilities: totalDebt.toString(),
      netWorth: netWorth.toString(),
    },
  });
}

export async function getHistory(days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);

  const snapshots = await prisma.netWorthSnapshot.findMany({
    where: { date: { gte: cutoff } },
    orderBy: { date: "asc" },
  });

  return snapshots.map((s) => ({
    date: s.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    netWorth: toNumber(s.netWorth),
    cash: toNumber(s.cash),
    stockValue: toNumber(s.stockValue),
    liabilities: toNumber(s.liabilities),
  }));
}
