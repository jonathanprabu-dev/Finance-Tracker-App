"use client";

import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtCurrency } from "@/lib/money";
import { ACCOUNT_TYPE_LABELS } from "@/lib/constants";
import { createAccount, updateAccount, deleteAccount } from "@/lib/actions/accounts";

type AccountRow = {
  id: string;
  name: string;
  type: string;
  balance: string;
};

export function AccountsManager({ accounts }: { accounts: AccountRow[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AccountRow | null>(null);
  const [pending, startTransition] = React.useTransition();

  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("CHECKING");
  const [balance, setBalance] = React.useState("");

  function openCreate() {
    setEditing(null);
    setName("");
    setType("CHECKING");
    setBalance("");
    setOpen(true);
  }

  function openEdit(acc: AccountRow) {
    setEditing(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(acc.balance);
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const payload = { name, type: type as never, balance };
      if (editing) await updateAccount(editing.id, payload);
      else await createAccount(payload);
      setOpen(false);
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this account? Linked transactions are kept.")) return;
    startTransition(async () => {
      await deleteAccount(id);
    });
  }

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-sm font-semibold">Cash Accounts</h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Account
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="w-20 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                No accounts yet. Add one to start tracking cash.
              </TableCell>
            </TableRow>
          )}
          {accounts.map((acc) => (
            <TableRow key={acc.id}>
              <TableCell className="font-medium">{acc.name}</TableCell>
              <TableCell>
                <Badge variant="muted">{ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}</Badge>
              </TableCell>
              <TableCell className="text-right font-mono">{fmtCurrency(acc.balance)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(acc)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(acc.id)}>
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
        title={editing ? "Edit Account" : "Add Account"}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="acc-name">Name</Label>
            <Input
              id="acc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Everyday Checking"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="acc-type">Type</Label>
              <Select id="acc-type" value={type} onChange={(e) => setType(e.target.value)}>
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-balance">Balance</Label>
              <Input
                id="acc-balance"
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                required
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
    </Card>
  );
}
