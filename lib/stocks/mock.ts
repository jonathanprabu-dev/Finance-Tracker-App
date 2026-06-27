import type { Quote, StockProvider } from "./provider";

// Deterministic-ish mock prices: a stable base per ticker plus a small,
// time-varying wobble so repeated "Refresh" calls produce visible movement
// without needing an API key.

const BASE_PRICES: Record<string, number> = {
  AAPL: 189.45,
  VOO: 452.3,
  MSFT: 418.2,
  TSLA: 242.1,
  NVDA: 880.5,
  GOOGL: 175.6,
  AMZN: 185.2,
  META: 505.4,
  SPY: 520.1,
  QQQ: 445.7,
};

function hashTicker(ticker: string): number {
  let h = 0;
  for (let i = 0; i < ticker.length; i++) {
    h = (h * 31 + ticker.charCodeAt(i)) % 100000;
  }
  return h;
}

export class MockProvider implements StockProvider {
  readonly name = "mock";

  async getQuote(ticker: string): Promise<Quote> {
    const symbol = ticker.toUpperCase();
    const base = BASE_PRICES[symbol] ?? 50 + (hashTicker(symbol) % 450);
    // Wobble: +/- ~2.5%, changes roughly every refresh (per-minute bucket).
    const minuteBucket = Math.floor(Date.now() / 60000);
    const seed = (hashTicker(symbol) + minuteBucket) % 1000;
    const wobble = ((seed / 1000) * 2 - 1) * 0.025; // -2.5% .. +2.5%
    const price = base * (1 + wobble);
    // Simulate light network latency.
    await new Promise((r) => setTimeout(r, 40));
    return { ticker: symbol, price: Math.round(price * 100) / 100 };
  }
}
