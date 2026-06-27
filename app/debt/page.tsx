import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DebtManager, type LiabilityRow } from "@/components/liabilities/debt-manager";
import { Card, CardContent } from "@/components/ui/card";
import { fmtCurrency, sum } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function DebtPage() {
  const liabilities = await prisma.liability.findMany({ orderBy: { createdAt: "asc" } });
  const totalDebt = sum(liabilities, (l) => l.totalBalance);
  const totalMin = sum(liabilities, (l) => l.monthlyMinPayment);

  const rows: LiabilityRow[] = liabilities.map((l) => ({
    id: l.id,
    name: l.name,
    type: l.type,
    totalBalance: l.totalBalance.toString(),
    originalBalance: l.originalBalance.toString(),
    interestRate: l.interestRate.toString(),
    monthlyMinPayment: l.monthlyMinPayment.toString(),
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Debt"
        description="Track loans and credit cards. Paying a 'Loan Payment' expense reduces these."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Debt</p>
            <p className="text-2xl font-semibold text-negative">{fmtCurrency(totalDebt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Min Payments / month</p>
            <p className="text-2xl font-semibold">{fmtCurrency(totalMin)}</p>
          </CardContent>
        </Card>
      </div>

      <DebtManager liabilities={rows} />
    </div>
  );
}
