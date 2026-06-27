import { Wallet, Landmark, TrendingUp, Flame } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { NetWorthTrend } from "@/components/dashboard/net-worth-trend";
import { ExpensePie } from "@/components/dashboard/expense-pie";
import { IncomeExpenseBar } from "@/components/dashboard/income-expense-bar";
import { fmtCurrency } from "@/lib/money";
import {
  getTotals,
  getMonthlyCashFlow,
  getExpenseByCategory,
  getIncomeVsExpense,
} from "@/lib/finance";
import { recordSnapshot, getHistory } from "@/lib/actions/snapshots";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Capture today's net worth so the trend always has a current data point.
  await recordSnapshot();

  const [totals, cashFlow, byCategory, incomeVsExpense, history] = await Promise.all([
    getTotals(),
    getMonthlyCashFlow(),
    getExpenseByCategory(),
    getIncomeVsExpense(6),
    getHistory(30),
  ]);

  const plUp = totals.portfolioPL.gte(0);
  const netUp = totals.netWorth.gte(0);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Dashboard"
        description="Your complete financial picture at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Net Worth"
          value={fmtCurrency(totals.netWorth)}
          tone={netUp ? "positive" : "negative"}
          icon={<Wallet className="h-4 w-4" />}
          sub={`${fmtCurrency(totals.cash)} cash + ${fmtCurrency(totals.stockValue)} stocks`}
        />
        <StatCard
          label="Total Debt"
          value={fmtCurrency(totals.totalDebt)}
          tone="negative"
          icon={<Landmark className="h-4 w-4" />}
          sub="Loans + credit cards"
        />
        <StatCard
          label="Portfolio P / L"
          value={fmtCurrency(totals.portfolioPL, { signed: true })}
          tone={plUp ? "positive" : "negative"}
          icon={<TrendingUp className="h-4 w-4" />}
          sub={`Market value ${fmtCurrency(totals.stockValue)}`}
        />
        <StatCard
          label="Monthly Burn Rate"
          value={fmtCurrency(cashFlow.expenses)}
          icon={<Flame className="h-4 w-4" />}
          sub={
            <span className={cashFlow.net.gte(0) ? "text-positive" : "text-negative"}>
              Net {fmtCurrency(cashFlow.net, { signed: true })} this month
            </span>
          }
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Net Worth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <NetWorthTrend data={history} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensePie data={byCategory} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Income vs. Expenses (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeExpenseBar data={incomeVsExpense} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
