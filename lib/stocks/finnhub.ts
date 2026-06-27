import type { Quote, StockProvider } from "./provider";

// Real Finnhub provider. Reads FINNHUB_API_KEY from the environment.
// Endpoint: GET https://finnhub.io/api/v1/quote?symbol=AAPL&token=KEY
// Response: { c: current, h, l, o, pc: prevClose, ... }
//
// Switch this on by setting STOCK_PROVIDER="finnhub" and FINNHUB_API_KEY in .env.
export class FinnhubProvider implements StockProvider {
  readonly name = "finnhub";
  private readonly apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error(
        "FINNHUB_API_KEY is not set. Set STOCK_PROVIDER=mock or provide a Finnhub key."
      );
    }
    this.apiKey = apiKey;
  }

  async getQuote(ticker: string): Promise<Quote> {
    const symbol = ticker.toUpperCase();
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
      symbol
    )}&token=${this.apiKey}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Finnhub request failed for ${symbol}: ${res.status}`);
    }
    const data = (await res.json()) as { c?: number };
    if (typeof data.c !== "number" || data.c === 0) {
      throw new Error(`Finnhub returned no price for ${symbol}`);
    }
    return { ticker: symbol, price: data.c };
  }
}
