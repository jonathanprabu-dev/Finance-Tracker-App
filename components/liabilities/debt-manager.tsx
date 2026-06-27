"use client";

import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { fmtCurrency, fmtPercent } from "@/lib/money";
import { LIABILITY_TYPE_LABELS } from "@/lib/constants";
import {
  createLiability,
  updateLiability,
  deleteLiability,
  type LiabilityInput,
} from "@/lib/actions/liabilities";

export type LiabilityRow = {
  id: string;
  name: string;
  type: string;
  totalBalance: string;
  originalBalance: string;
  interestRate: string;
  monthlyMinPayment: string;
};

export function DebtManager({ liabilities }: { liabilities: LiabilityRow[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LiabilityRow | null>(null);
  const [pending, startTransition] = React.useTransition();

  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("LOAN");
  const [totalBalance, setTotalBalance] = React.useState("");
  const [originalBalance, setOriginalBalance] = React.useState("");
  const [interestRate, setInterestRate] = React.useState("");
  const [monthlyMinPayment, setMonthlyMinPayment] = React.useState("");

  function openCreate() {
    setEditing(null);
    setName("");
    setType("LOAN");
    setTotalBalance("");
    setOriginalBalance("");
    setInterestRate("");
    setMonthlyMinPayment("");
    setOpen(true);
  }

  function openEdit(l: LiabilityRow) {
    setEditing(l);
    setName(l.name);
    setType(l.type);
    setTotalBalance(l.totalBalance);
    setOriginalBalance(l.originalBalance);
    setInterestRate(l.interestRate);
    setMonthlyMinPayment(l.monthlyMinPayment);
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: LiabilityInput = {
      name,
      type: type as never,
      totalBalance,
      originalBalance: originalBalance || totalBalance,
      interestRate,
      monthlyMinPayment,
    };
    startTransition(async () => {
      if (editing) await updateLiability(editing.id, payload);
      else await createLiability(payload);
      setOpen(false);
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this liability?")) return;
    startTransition(async () => {
      await deleteLiability(id);
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Liability
        </Button>
      </div>

      {liabilities.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No liabilities tracked. Add a loan or credit card to get started.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {liabilities.map((l) => {
          const total = Number(l.totalBalance);
          const original = Number(l.originalBalance) || total;
          const paid = Math.max(0, original - total);
          const pct = original > 0 ? (paid / original) * 100 : 0;
          return (
            <Card key={l.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{l.name}</h3>
                      <Badge variant={l.type === "CREDIT_CARD" ? "accent" : "muted"}>
                        {LIABILITY_TYPE_LABELS[l.type] ?? l.type}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {fmtPercent(l.interestRate)} APR · Min {fmtCurrency(l.monthlyMinPayment)}/mo
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(l)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(l.id)}>
                      <Trash2 className="h-4 w-4 text-negative" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-xl font-semibold">{fmtCurrency(l.totalBalance)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Paid off</p>
                    <p className="text-sm font-medium text-positive">{fmtCurrency(paid)}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <Progress
                    value={pct}
                    indicatorClassName={l.type === "CREDIT_CARD" ? "bg-positive" : "bg-accent"}
                  />
                  <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>{pct.toFixed(1)}% paid</span>
                    <span>of {fmtCurrency(original)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Liability" : "Add Liability"}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="l-name">Name</Label>
              <Input
                id="l-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Home Loan"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-type">Type</Label>
              <Select id="l-type" value={type} onChange={(e) => setType(e.target.value)}>
                {Object.entries(LIABILITY_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="l-total">Current Balance</Label>
              <Input
                id="l-total"
                type="number"
                step="0.01"
                value={totalBalance}
                onChange={(e) => setTotalBalance(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-original">Original Balance</Label>
              <Input
                id="l-original"
                type="number"
                step="0.01"
                value={originalBalance}
                onChange={(e) => setOriginalBalance(e.target.value)}
                placeholder="Defaults to current"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="l-rate">Interest Rate (%)</Label>
              <Input
                id="l-rate"
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-min">Min Payment</Label>
              <Input
                id="l-min"
                type="number"
                step="0.01"
                value={monthlyMinPayment}
                onChange={(e) => setMonthlyMinPayment(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

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
    </>
  );
}
