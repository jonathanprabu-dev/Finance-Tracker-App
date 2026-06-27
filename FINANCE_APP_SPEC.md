# Project Specification: Unified Finance & Stock Tracker

## 1. Project Overview
A personal finance application designed to manage cash flow (income/expenses),
debt (loans/credit cards), and investment performance (stock portfolio). The
goal is to provide a single "Net Worth" dashboard.

## 2. Tech Stack
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + hand-rolled shadcn-style UI primitives (`components/ui/*`)
- **Database:** SQLite with Prisma ORM (local/personal use)
- **State:** React Server Components + Server Actions + small client hooks
- **Charts:** Recharts
- **Money:** `decimal.js` for all financial math
- **Stock API:** pluggable provider — mock by default, Finnhub `/quote` ready

## 3. Data Model
See `prisma/schema.prisma` for the authoritative schema. Summary:

- **Account** — `id`, `name`, `type` (CHECKING|SAVINGS|CASH), `balance`. Cash
  source for net worth.
- **Transaction** — `id`, `date`, `amount`, `type` (INCOME|EXPENSE), `category`,
  `isRecurring`, `note?`, `accountId?`, `liabilityId?` (set for loan payments).
- **Liability** — `id`, `name`, `type` (LOAN|CREDIT_CARD), `totalBalance`,
  `originalBalance` (for paid-off progress), `interestRate`, `monthlyMinPayment`.
- **Stock** — `id`, `ticker`, `sharesOwned`, `avgBuyPrice`, `lastPrice`, `lastUpdated`.
- **NetWorthSnapshot** — `id`, `date` (unique/day), `cash`, `stockValue`,
  `liabilities`, `netWorth`. Powers the trend chart.

## 4. Functional Requirements

### 4.1 Income & Expense Tracking
- Manual entry form with category tagging (Ledger page).
- Searchable/filterable ledger table (by text, type, category).
- Recurring view: all transactions where `isRecurring` is true (Subscriptions page).
- **Loan linkage:** tagging an expense as "Loan Payment" prompts selection of a
  liability and reduces its `totalBalance` accordingly (atomic).

### 4.2 Stock Portfolio
- Add holdings by ticker, shares, and average buy price.
- "Refresh Prices" updates `lastPrice` via the configured provider.
- Unrealized P/L = `(lastPrice - avgBuyPrice) * sharesOwned`.

### 4.3 Dashboard ("Net Worth" view)
- Net Worth = (Total Cash + Total Stock Value) − Total Liabilities.
- Monthly Burn Rate = sum of EXPENSE transactions in the current month.
- Visuals: net-worth trend (area), expenses by category (pie), monthly
  income vs. expenses (bar).

## 5. Pages
- `/` Dashboard · `/ledger` Ledger · `/investments` Holdings · `/debt`
  Liabilities (progress bars) · `/subscriptions` Recurring · `/settings` Accounts.

## 6. Stock Provider
`lib/stocks` exposes `getQuote`/`getQuotes` behind a `StockProvider` interface.
Set `STOCK_PROVIDER=mock` (default, no key) or `STOCK_PROVIDER=finnhub` with
`FINNHUB_API_KEY`. `getQuotes` throttles real requests for the free tier.
