import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtCurrency, sum } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const recurring = await prisma.transaction.findMany({
    where: { isRecurring: true },
    orderBy: { amount: "desc" },
    include: { account: true },
  });

  // De-duplicate by category + note so repeated monthly charges show once,
  // using the most recent occurrence.
  const seen = new Map<string, (typeof recurring)[number]>();
  for (const t of recurring) {
    const key = `${t.type}|${t.category}|${t.note ?? ""}`;
    const existing = seen.get(key);
    if (!existing || t.date > existing.date) seen.set(key, t);
  }
  const unique = Array.from(seen.values());

  const expenses = unique.filter((t) => t.type === "EXPENSE");
  const income = unique.filter((t) => t.type === "INCOME");
  const monthlyExpense = sum(expenses, (t) => t.amount);
  const monthlyIncome = sum(income, (t) => t.amount);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Subscriptions & Recurring"
        description="Every transaction flagged as recurring — your regular bills and income."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Recurring Expenses</p>
            <p className="text-2xl font-semibold text-negative">{fmtCurrency(monthlyExpense)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Recurring Income</p>
            <p className="text-2xl font-semibold text-positive">{fmtCurrency(monthlyIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
            <p className="text-2xl font-semibold">{expenses.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unique.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No recurring transactions. Flag a transaction as recurring in the Ledger.
                </TableCell>
              </TableRow>
            )}
            {unique.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.note || t.category}</TableCell>
                <TableCell>
                  <Badge variant="muted">{t.category}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{t.account?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={t.type === "INCOME" ? "positive" : "negative"}>
                    {t.type === "INCOME" ? "Income" : "Expense"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {fmtCurrency(t.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
