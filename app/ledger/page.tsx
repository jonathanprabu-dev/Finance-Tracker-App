import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Ledger, type TxRow } from "@/components/transactions/ledger";

export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  const [transactions, accounts, liabilities] = await Promise.all([
    prisma.transaction.findMany({
      orderBy: { date: "desc" },
      include: { account: true, liability: true },
    }),
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.liability.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows: TxRow[] = transactions.map((t) => ({
    id: t.id,
    date: t.date.toISOString(),
    dateLabel: t.date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }),
    amount: t.amount.toString(),
    type: t.type,
    category: t.category,
    isRecurring: t.isRecurring,
    note: t.note,
    accountId: t.accountId,
    accountName: t.account?.name ?? null,
    liabilityId: t.liabilityId,
    liabilityName: t.liability?.name ?? null,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Ledger"
        description="All income and expenses. Tag an expense as a Loan Payment to pay down debt."
      />
      <Ledger
        transactions={rows}
        accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
        liabilities={liabilities.map((l) => ({ id: l.id, name: l.name }))}
      />
    </div>
  );
}
