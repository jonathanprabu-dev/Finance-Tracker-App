"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtCurrency } from "@/lib/money";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  LOAN_PAYMENT_CATEGORY,
} from "@/lib/constants";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type TransactionInput,
} from "@/lib/actions/transactions";

export type TxRow = {
  id: string;
  date: string; // ISO
  dateLabel: string; // preformatted on the server to avoid hydration tz mismatch
  amount: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  isRecurring: boolean;
  note: string | null;
  accountId: string | null;
  accountName: string | null;
  liabilityId: string | null;
  liabilityName: string | null;
};

type Option = { id: string; name: string };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function Ledger({
  transactions,
  accounts,
  liabilities,
}: {
  transactions: TxRow[];
  accounts: Option[];
  liabilities: Option[];
}) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TxRow | null>(null);
  const [pending, startTransition] = React.useTransition();

  // Filters
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");

  // Form state
  const [type, setType] = React.useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [date, setDate] = React.useState(todayISO());
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState<string>("Food");
  const [accountId, setAccountId] = React.useState("");
  const [liabilityId, setLiabilityId] = React.useState("");
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [note, setNote] = React.useState("");

  const isLoanPayment = type === "EXPENSE" && category === LOAN_PAYMENT_CATEGORY;

  const allCategories = React.useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))).sort(),
    [transactions]
  );

  const filtered = transactions.filter((t) => {
    if (typeFilter !== "ALL" && t.type !== typeFilter) return false;
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      const hay = `${t.category} ${t.note ?? ""} ${t.accountName ?? ""} ${t.liabilityName ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  function openCreate() {
    setEditing(null);
    setType("EXPENSE");
    setDate(todayISO());
    setAmount("");
    setCategory("Food");
    setAccountId(accounts[0]?.id ?? "");
    setLiabilityId("");
    setIsRecurring(false);
    setNote("");
    setOpen(true);
  }

  function openEdit(t: TxRow) {
    setEditing(t);
    setType(t.type);
    setDate(t.date.slice(0, 10));
    setAmount(t.amount);
    setCategory(t.category);
    setAccountId(t.accountId ?? "");
    setLiabilityId(t.liabilityId ?? "");
    setIsRecurring(t.isRecurring);
    setNote(t.note ?? "");
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: TransactionInput = {
      date,
      amount,
      type,
      category,
      isRecurring,
      note,
      accountId: accountId || null,
      liabilityId: isLoanPayment ? liabilityId || null : null,
    };
    startTransition(async () => {
      if (editing) await updateTransaction(editing.id, payload);
      else await createTransaction(payload);
      setOpen(false);
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this transaction? Balances will be reversed.")) return;
    startTransition(async () => {
      await deleteTransaction(id);
    });
  }

  const categoryOptions = type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes, categories, accounts..."
              className="pl-9"
            />
          </div>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="sm:w-36"
          >
            <option value="ALL">All types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </Select>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="sm:w-44"
          >
            <option value="ALL">All categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-20 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No transactions match your filters.
              </TableCell>
            </TableRow>
          )}
          {filtered.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {t.dateLabel}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.category}</span>
                  {t.isRecurring && (
                    <RefreshCw className="h-3 w-3 text-muted-foreground" aria-label="Recurring" />
                  )}
                </div>
                {t.liabilityName && (
                  <span className="text-xs text-muted-foreground">→ {t.liabilityName}</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{t.accountName ?? "—"}</TableCell>
              <TableCell className="max-w-40 truncate text-muted-foreground">
                {t.note ?? "—"}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={`font-mono font-medium ${
                    t.type === "INCOME" ? "text-positive" : "text-foreground"
                  }`}
                >
                  {t.type === "INCOME" ? "+" : "−"}
                  {fmtCurrency(t.amount)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(t)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(t.id)}>
                    <Trash2 className="h-4 w-4 text-negative" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Transaction" : "Add Transaction"}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tx-type">Type</Label>
              <Select
                id="tx-type"
                value={type}
                onChange={(e) => {
                  const next = e.target.value as "INCOME" | "EXPENSE";
                  setType(next);
                  setCategory(next === "INCOME" ? "Salary" : "Food");
                }}
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tx-date">Date</Label>
              <Input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tx-amount">Amount</Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tx-category">Category</Label>
              <Select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tx-account">Account</Label>
            <Select
              id="tx-account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="">No account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>

          {isLoanPayment && (
            <div className="space-y-1.5 rounded-md border border-accent/30 bg-accent/5 p-3">
              <Label htmlFor="tx-liability">Apply payment to liability</Label>
              <Select
                id="tx-liability"
                value={liabilityId}
                onChange={(e) => setLiabilityId(e.target.value)}
              >
                <option value="">Select a liability…</option>
                {liabilities.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground">
                This reduces the selected liability&apos;s balance by the amount.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="tx-note">Note (optional)</Label>
            <Input
              id="tx-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Groceries at Costco"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-[var(--accent)]"
            />
            Recurring (subscription / regular bill)
          </label>

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
