"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { LiabilityType } from "@prisma/client";

export type LiabilityInput = {
  name: string;
  type: LiabilityType;
  totalBalance: string;
  originalBalance: string;
  interestRate: string;
  monthlyMinPayment: string;
};

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/debt");
  revalidatePath("/ledger");
}

export async function createLiability(input: LiabilityInput) {
  const original = input.originalBalance || input.totalBalance;
  await prisma.liability.create({
    data: {
      name: input.name.trim(),
      type: input.type,
      totalBalance: input.totalBalance || "0",
      originalBalance: original || "0",
      interestRate: input.interestRate || "0",
      monthlyMinPayment: input.monthlyMinPayment || "0",
    },
  });
  revalidateAll();
}

export async function updateLiability(id: string, input: LiabilityInput) {
  await prisma.liability.update({
    where: { id },
    data: {
      name: input.name.trim(),
      type: input.type,
      totalBalance: input.totalBalance || "0",
      originalBalance: input.originalBalance || "0",
      interestRate: input.interestRate || "0",
      monthlyMinPayment: input.monthlyMinPayment || "0",
    },
  });
  revalidateAll();
}

export async function deleteLiability(id: string) {
  await prisma.liability.delete({ where: { id } });
  revalidateAll();
}
