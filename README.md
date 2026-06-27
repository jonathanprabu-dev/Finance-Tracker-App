# FinTrack — Unified Finance & Stock Tracker

A personal finance app that unifies cash flow, debt, and investments into a
single **Net Worth** dashboard. Built with Next.js (App Router), Prisma +
SQLite, Tailwind, and Recharts.

## Features

- **Dashboard** — Net Worth, Total Debt, Portfolio P/L, Monthly Burn Rate,
  plus a net-worth trend, expense-by-category pie, and income-vs-expense bars.
- **Ledger** — searchable/filterable income & expense tracking. Tagging an
  expense as a **Loan Payment** pays down a selected liability automatically.
- **Investments** — holdings with unrealized P/L, sparklines, and a
  "Refresh Prices" button (mock provider by default; Finnhub-ready).
- **Debt** — loans & credit cards with paid-vs-remaining progress bars.
- **Subscriptions** — every recurring transaction in one place.
- **Accounts** — manage the cash accounts that feed Net Worth.

All money math uses `decimal.js`; all mutations are Server Actions.

## Getting Started

```bash
npm install
cp .env.example .env          # then edit if needed
npm run db:migrate            # create the SQLite db + schema
npm run db:seed               # load demo data
npm run dev                   # http://localhost:3000
```

## Stock Prices

Prices come from a pluggable provider (`lib/stocks`):

- **Mock (default):** no API key. Deterministic prices with light movement on
  each refresh — great for development.
- **Finnhub:** set in `.env`:

  ```env
  STOCK_PROVIDER="finnhub"
  FINNHUB_API_KEY="your_key_here"
  ```

  Get a free key at <https://finnhub.io>. `getQuotes` throttles requests to
  respect the free-tier rate limit.

## Scripts

| Script               | Purpose                        |
| -------------------- | ------------------------------ |
| `npm run dev`        | Start the dev server           |
| `npm run build`      | Production build               |
| `npm run db:migrate` | Apply Prisma migrations        |
| `npm run db:seed`    | Seed demo data                 |
| `npm run db:reset`   | Reset the database and re-seed |

## Project Structure

```
app/            # routes (Server Components)
components/      # ui primitives + feature components (client where interactive)
lib/
  actions/       # Server Actions (transactions, accounts, liabilities, stocks, snapshots)
  stocks/        # provider interface + mock + finnhub
  finance.ts     # net worth / cash flow / chart aggregations
  money.ts       # decimal.js helpers
prisma/          # schema, migrations, seed
```

See `FINANCE_APP_SPEC.md` for the full spec and `CLAUDE.md` for project rules.
