import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Portfolio, type StockRow } from "@/components/investments/portfolio";
import { Card, CardContent } from "@/components/ui/card";
import { d, mul, fmtCurrency, toNumber } from "@/lib/money";
import { providerName } from "@/lib/stocks";
import Decimal from "decimal.js";

export const dynamic = "force-dynamic";

export default async function InvestmentsPage() {
  const stocks = await prisma.stock.findMany({ orderBy: { ticker: "asc" } });

  let totalValue = d(0);
  let totalCost = d(0);

  const rows: StockRow[] = stocks.map((s) => {
    const marketValue = mul(s.lastPrice, s.sharesOwned);
    const costBasis = mul(s.avgBuyPrice, s.sharesOwned);
    const pl = marketValue.minus(costBasis);
    const plPct = costBasis.isZero() ? new Decimal(0) : pl.div(costBasis).times(100);
    totalValue = totalValue.plus(marketValue);
    totalCost = totalCost.plus(costBasis);
    return {
      id: s.id,
      ticker: s.ticker,
      sharesOwned: s.sharesOwned.toString(),
      avgBuyPrice: s.avgBuyPrice.toString(),
      lastPrice: s.lastPrice.toString(),
      lastUpdated: s.lastUpdated.toISOString(),
      marketValue: toNumber(marketValue),
      costBasis: toNumber(costBasis),
      pl: toNumber(pl),
      plPct: toNumber(plPct),
    };
  });

  const totalPL = totalValue.minus(totalCost);
  const totalPLPct = totalCost.isZero() ? new Decimal(0) : totalPL.div(totalCost).times(100);
  const up = totalPL.gte(0);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Investments"
        description="Your stock holdings and unrealized profit / loss."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Portfolio Value</p>
            <p className="text-2xl font-semibold">{fmtCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Cost Basis</p>
            <p className="text-2xl font-semibold">{fmtCurrency(totalCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Unrealized P / L</p>
            <p className={`text-2xl font-semibold ${up ? "text-positive" : "text-negative"}`}>
              {fmtCurrency(totalPL, { signed: true })}
            </p>
            <p className={`text-xs ${up ? "text-positive" : "text-negative"}`}>
              {up ? "+" : ""}
              {totalPLPct.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Portfolio stocks={rows} providerName={providerName()} />
    </div>
  );
}
