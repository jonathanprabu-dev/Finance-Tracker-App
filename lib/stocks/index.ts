import type { Quote, StockProvider } from "./provider";
import { MockProvider } from "./mock";
import { FinnhubProvider } from "./finnhub";

let provider: StockProvider | null = null;

function getProvider(): StockProvider {
  if (provider) return provider;

  const choice = (process.env.STOCK_PROVIDER ?? "mock").toLowerCase();
  if (choice === "finnhub") {
    provider = new FinnhubProvider(process.env.FINNHUB_API_KEY ?? "");
  } else {
    provider = new MockProvider();
  }
  return provider;
}

export function providerName(): string {
  return getProvider().name;
}

export async function getQuote(ticker: string): Promise<Quote> {
  return getProvider().getQuote(ticker);
}

// Fetch many quotes with light throttling so the real Finnhub free tier
// (≈60 req/min) is respected. The mock provider is unaffected.
export async function getQuotes(tickers: string[]): Promise<Quote[]> {
  const results: Quote[] = [];
  const isMock = providerName() === "mock";
  for (const ticker of tickers) {
    try {
      results.push(await getQuote(ticker));
    } catch (err) {
      console.error(`Failed to fetch quote for ${ticker}:`, err);
    }
    if (!isMock) await new Promise((r) => setTimeout(r, 1100));
  }
  return results;
}

export type { Quote, StockProvider };
