"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { d } from "@/lib/money";
import type { Prisma, PrismaClient, TransactionType } from "@prisma/client";

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export type TransactionInput = {
  date: string; // ISO date string (yyyy-mm-dd)
  amount: string;
  type: TransactionType;
  category: string;
  isRecurring: boolean;
  note?: string;
  accountId?: string | null;
  liabilityId?: string | null;
};

type Effect = {
  type: TransactionType;
  amount: Prisma.Decimal | string;
  accountId?: string | null;
  liabilityId?: string | null;
};

// Apply (sign = +1) or reverse (sign = -1) a transaction's effect on the
// linked account balance and liability balance, within a DB transaction.
async function applyEffect(tx: TxClient, effect: Effect, sign: 1 | -1) {
  const amount = d(effect.amount);

  if (effect.accountId) {
    const account = await tx.account.findUnique({ where: { id: effect.accountId } });
    if (account) {
      // INCOME raises cash, EXPENSE lowers it; sign flips when reversing.
      const direction = effect.type === "INCOME" ? 1 : -1;
      const delta = amount.times(direction * sign);
      await tx.account.update({
        where: { id: effect.accountId },
        data: { balance: d(account.balance).plus(delta).toString() },
      });
    }
  }

  if (effect.liabilityId) {
    const liability = await tx.liability.findUnique({ where: { id: effect.liabilityId } });
    if (liability) {
      // A loan payment reduces the amount owed; reversing adds it back.
      const delta = amount.times(-1 * sign);
      const next = d(liability.totalBalance).plus(delta);
      await tx.liability.update({
        where: { id: effect.liabilityId },
        data: { totalBalance: (next.isNegative() ? d(0) : next).toString() },
      });
    }
  }
}

function normalize(input: TransactionInput) {
  const isLoanPayment = !!input.liabilityId;
  return {
    date: new Date(input.date),
    amount: input.amount,
    type: input.type,
    category: input.category,
    isRecurring: input.isRecurring,
    note: input.note?.trim() || null,
    accountId: input.accountId || null,
    // Only EXPENSE transactions can be linked to a liability.
    liabilityId: input.type === "EXPENSE" && isLoanPayment ? input.liabilityId : null,
  };
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/ledger");
  revalidatePath("/debt");
  revalidatePath("/subscriptions");
  revalidatePath("/settings");
}

export async function createTransaction(input: TransactionInput) {
  const data = normalize(input);
  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({ data });
    await applyEffect(tx, data, 1);
  });
  revalidateAll();
}

export async function updateTransaction(id: string, input: TransactionInput) {
  const data = normalize(input);
  await prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findUnique({ where: { id } });
    if (!existing) throw new Error("Transaction not found");
    // Reverse the old effect, then apply the new one.
    await applyEffect(tx, existing, -1);
    await tx.transaction.update({ where: { id }, data });
    await applyEffect(tx, data, 1);
  });
  revalidateAll();
}

export async function deleteTransaction(id: string) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findUnique({ where: { id } });
    if (!existing) return;
    await applyEffect(tx, existing, -1);
    await tx.transaction.delete({ where: { id } });
  });
  revalidateAll();
}
