// Common contract every stock price source must satisfy.
// Build against this interface so the data source (mock vs Finnhub vs
// Alpha Vantage) can be swapped via env without touching call sites.

export interface Quote {
  ticker: string;
  price: number; // latest/daily close price
}

export interface StockProvider {
  readonly name: string;
  getQuote(ticker: string): Promise<Quote>;
}
