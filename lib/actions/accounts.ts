"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { AccountType } from "@prisma/client";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath("/ledger");
}

export async function createAccount(data: {
  name: string;
  type: AccountType;
  balance: string;
}) {
  await prisma.account.create({
    data: {
      name: data.name.trim(),
      type: data.type,
      balance: data.balance || "0",
    },
  });
  revalidateAll();
}

export async function updateAccount(
  id: string,
  data: { name: string; type: AccountType; balance: string }
) {
  await prisma.account.update({
    where: { id },
    data: {
      name: data.name.trim(),
      type: data.type,
      balance: data.balance || "0",
    },
  });
  revalidateAll();
}

export async function deleteAccount(id: string) {
  // Transactions reference accounts with onDelete: SetNull, so they survive.
  await prisma.account.delete({ where: { id } });
  revalidateAll();
}
