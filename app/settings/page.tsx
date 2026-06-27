import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { AccountsManager } from "@/components/accounts/accounts-manager";
import { Card, CardContent } from "@/components/ui/card";
import { fmtCurrency, sum } from "@/lib/money";
import { providerName } from "@/lib/stocks";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const accounts = await prisma.account.findMany({ orderBy: { createdAt: "asc" } });
  const totalCash = sum(accounts, (a) => a.balance);

  const rows = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    balance: a.balance.toString(),
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Accounts"
        description="Manage the cash accounts that feed your Net Worth."
      />

      <Card className="mb-6">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">Total Cash</p>
            <p className="text-2xl font-semibold">{fmtCurrency(totalCash)}</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Stock price source</p>
            <p className="font-medium text-foreground capitalize">{providerName()}</p>
          </div>
        </CardContent>
      </Card>

      <AccountsManager accounts={rows} />
    </div>
  );
}
