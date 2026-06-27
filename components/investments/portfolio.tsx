"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sparkline } from "@/components/investments/sparkline";
import { fmtCurrency, fmtShares } from "@/lib/money";
import {
  createStock,
  updateStock,
  deleteStock,
  refreshPrices,
  type StockInput,
} from "@/lib/actions/stocks";

export type StockRow = {
  id: string;
  ticker: string;
  sharesOwned: string;
  avgBuyPrice: string;
  lastPrice: string;
  lastUpdated: string;
  marketValue: number;
  costBasis: number;
  pl: number;
  plPct: number;
};

export function Portfolio({
  stocks,
  providerName,
}: {
  stocks: StockRow[];
  providerName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<StockRow | null>(null);
  const [pending, startTransition] = React.useTransition();
  const [refreshing, setRefreshing] = React.useState(false);

  const [ticker, setTicker] = React.useState("");
  const [sharesOwned, setShares] = React.useState("");
  const [avgBuyPrice, setAvg] = React.useState("");

  function openCreate() {
    setEditing(null);
    setTicker("");
    setShares("");
    setAvg("");
    setOpen(true);
  }

  function openEdit(s: StockRow) {
    setEditing(s);
    setTicker(s.ticker);
    setShares(s.sharesOwned);
    setAvg(s.avgBuyPrice);
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: StockInput = { ticker, sharesOwned, avgBuyPrice };
    startTransition(async () => {
      if (editing) await updateStock(editing.id, payload);
      else await createStock(payload);
      setOpen(false);
    });
  }

  function remove(id: string) {
    if (!confirm("Remove this holding?")) return;
    startTransition(async () => {
      await deleteStock(id);
    });
  }

  function refresh() {
    setRefreshing(true);
    startTransition(async () => {
      await refreshPrices();
      router.refresh();
      setRefreshing(false);
    });
  }

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Holdings</h2>
          <Badge variant="muted">source: {providerName}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing || pending}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Prices"}
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Stock
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Avg Cost</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Trend</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
            <TableHead className="text-right">P / L</TableHead>
            <TableHead className="w-20 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                No holdings yet. Add a stock to track its performance.
              </TableCell>
            </TableRow>
          )}
          {stocks.map((s) => {
            const up = s.pl >= 0;
            return (
              <TableRow key={s.id}>
                <TableCell className="font-semibold">{s.ticker}</TableCell>
                <TableCell className="text-right font-mono">{fmtShares(s.sharesOwned)}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {fmtCurrency(s.avgBuyPrice)}
                </TableCell>
                <TableCell className="text-right font-mono">{fmtCurrency(s.lastPrice)}</TableCell>
                <TableCell>
                  <Sparkline seed={s.ticker} up={up} />
                </TableCell>
                <TableCell className="text-right font-mono">{fmtCurrency(s.marketValue)}</TableCell>
                <TableCell className="text-right">
                  <div className={`font-mono font-medium ${up ? "text-positive" : "text-negative"}`}>
                    {fmtCurrency(s.pl, { signed: true })}
                  </div>
                  <div className={`text-xs ${up ? "text-positive" : "text-negative"}`}>
                    {up ? "+" : ""}
                    {s.plPct.toFixed(2)}%
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(s.id)}>
                      <Trash2 className="h-4 w-4 text-negative" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Holding" : "Add Stock"}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="s-ticker">Ticker</Label>
            <Input
              id="s-ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="AAPL"
              required
              disabled={!!editing}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-shares">Shares Owned</Label>
              <Input
                id="s-shares"
                type="number"
                step="0.0001"
                value={sharesOwned}
                onChange={(e) => setShares(e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-avg">Avg Buy Price</Label>
              <Input
                id="s-avg"
                type="number"
                step="0.01"
                value={avgBuyPrice}
                onChange={(e) => setAvg(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Latest price is fetched via the {providerName} provider on “Refresh Prices”.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Dialog>
    </Card>
  );
}
