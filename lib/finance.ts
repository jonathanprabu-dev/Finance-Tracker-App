import { prisma } from "@/lib/prisma";
import { d, sum, mul, toNumber } from "@/lib/money";
import Decimal from "decimal.js";

// Server-side read helpers that aggregate the core financial figures.
// Used by the dashboard and snapshot recorder. Not Server Actions — these
// are plain async functions invoked from Server Components / actions.

export async function getTotals() {
  const [accounts, stocks, liabilities] = await Promise.all([
    prisma.account.findMany(),
    prisma.stock.findMany(),
    prisma.liability.findMany(),
  ]);

  const cash = sum(accounts, (a) => a.balance);
  const stockValue = stocks.reduce<Decimal>(
    (acc, s) => acc.plus(mul(s.lastPrice, s.sharesOwned)),
    d(0)
  );
  const stockCost = stocks.reduce<Decimal>(
    (acc, s) => acc.plus(mul(s.avgBuyPrice, s.sharesOwned)),
    d(0)
  );
  const totalDebt = sum(liabilities, (l) => l.totalBalance);
  const portfolioPL = stockValue.minus(stockCost);
  const netWorth = cash.plus(stockValue).minus(totalDebt);

  return { cash, stockValue, stockCost, portfolioPL, totalDebt, netWorth };
}

export function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

export async function getMonthlyCashFlow() {
  const { start, end } = monthRange();
  const txns = await prisma.transaction.findMany({
    where: { date: { gte: start, lt: end } },
  });
  const income = sum(
    txns.filter((t) => t.type === "INCOME"),
    (t) => t.amount
  );
  const expenses = sum(
    txns.filter((t) => t.type === "EXPENSE"),
    (t) => t.amount
  );
  return { income, expenses, net: income.minus(expenses) };
}

// Expense totals grouped by category for the current month (for the pie chart).
export async function getExpenseByCategory() {
  const { start, end } = monthRange();
  const grouped = await prisma.transaction.groupBy({
    by: ["category"],
    where: { type: "EXPENSE", date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  return grouped
    .map((g) => ({
      category: g.category,
      amount: toNumber(g._sum.amount ?? 0),
    }))
    .filter((g) => g.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

// Last N months of income vs expense for the bar chart.
export async function getIncomeVsExpense(months = 6) {
  const now = new Date();
  const result: { month: string; income: number; expenses: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const { start, end } = monthRange(ref);
    const txns = await prisma.transaction.findMany({
      where: { date: { gte: start, lt: end } },
    });
    const income = toNumber(
      sum(txns.filter((t) => t.type === "INCOME"), (t) => t.amount)
    );
    const expenses = toNumber(
      sum(txns.filter((t) => t.type === "EXPENSE"), (t) => t.amount)
    );
    result.push({
      month: ref.toLocaleString("en-US", { month: "short" }),
      income,
      expenses,
    });
  }
  return result;
}
