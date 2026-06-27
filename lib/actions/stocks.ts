"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getQuotes } from "@/lib/stocks";

export type StockInput = {
  ticker: string;
  sharesOwned: string;
  avgBuyPrice: string;
  lastPrice?: string;
};

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/investments");
}

export async function createStock(input: StockInput) {
  const ticker = input.ticker.trim().toUpperCase();
  const last = input.lastPrice || input.avgBuyPrice || "0";
  await prisma.stock.upsert({
    where: { ticker },
    update: {
      sharesOwned: input.sharesOwned || "0",
      avgBuyPrice: input.avgBuyPrice || "0",
    },
    create: {
      ticker,
      sharesOwned: input.sharesOwned || "0",
      avgBuyPrice: input.avgBuyPrice || "0",
      lastPrice: last,
      lastUpdated: new Date(),
    },
  });
  revalidateAll();
}

export async function updateStock(id: string, input: StockInput) {
  await prisma.stock.update({
    where: { id },
    data: {
      ticker: input.ticker.trim().toUpperCase(),
      sharesOwned: input.sharesOwned || "0",
      avgBuyPrice: input.avgBuyPrice || "0",
    },
  });
  revalidateAll();
}

export async function deleteStock(id: string) {
  await prisma.stock.delete({ where: { id } });
  revalidateAll();
}

// Pull the latest price for every holding via the configured provider
// (mock by default; Finnhub when STOCK_PROVIDER=finnhub).
export async function refreshPrices() {
  const stocks = await prisma.stock.findMany();
  if (stocks.length === 0) return { updated: 0 };

  const quotes = await getQuotes(stocks.map((s) => s.ticker));
  const byTicker = new Map(quotes.map((q) => [q.ticker, q.price]));

  let updated = 0;
  for (const stock of stocks) {
    const price = byTicker.get(stock.ticker.toUpperCase());
    if (price === undefined) continue;
    await prisma.stock.update({
      where: { id: stock.id },
      data: { lastPrice: price.toString(), lastUpdated: new Date() },
    });
    updated++;
  }

  revalidateAll();
  return { updated };
}
