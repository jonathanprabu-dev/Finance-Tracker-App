# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

FinTrack is a single-user, local personal finance app (cash flow, debt, stock
portfolio) that rolls up into one Net Worth dashboard. Next.js App Router +
React 19, SQLite via Prisma, Tailwind v4, Recharts. `FINANCE_APP_SPEC.md` is the
authoritative spec for the data model and requirements.

## Commands

```bash
npm run dev          # start dev server (next dev)
npm run build        # production build
npm run lint         # eslint
npm run db:migrate   # prisma migrate dev — after editing schema.prisma
npm run db:seed      # tsx prisma/seed.ts — load demo data
npm run db:reset     # prisma migrate reset --force — wipe + reseed
```

There is no test suite. `DATABASE_URL` and the stock-provider env vars live in
`.env` (see `.env.example`). After changing `prisma/schema.prisma`, run
`db:migrate` so the generated client and SQLite DB stay in sync.

## Architecture

**Request flow.** Pages under `app/*` are async Server Components. They read
through `lib/prisma.ts` (a global singleton) and the aggregation helpers in
`lib/finance.ts`, then pass plain data to client components under `components/*`.
Mutations happen exclusively through Server Actions in `lib/actions/*`
(`"use server"`), which write to Prisma and call `revalidatePath` for affected
routes. Read-heavy pages set `export const dynamic = "force-dynamic"`.

**The Decimal boundary is the central pattern.** All money is stored as Prisma
`Decimal` and computed with `decimal.js` via `lib/money.ts` (`d`, `add`, `sub`,
`mul`, `sum`, plus formatters). Prisma `Decimal` is *not* serializable across the
Server→Client boundary, so Server Components convert to primitives right before
handing data to client components — `.toString()` for exact values, `toNumber()`
for chart inputs (see `app/investments/page.tsx`).

**Balances are derived, kept in lockstep with transactions.**
`lib/actions/transactions.ts` is the most delicate file: each transaction has an
"effect" on a linked `Account.balance` and/or `Liability.totalBalance`. Create
applies the effect, delete reverses it, and update reverses the old effect then
applies the new one — all inside one `prisma.$transaction`. INCOME raises cash /
EXPENSE lowers it; a loan payment (EXPENSE linked to a liability) reduces the
amount owed (floored at 0). Any edit to balance logic must preserve this
apply/reverse symmetry or balances drift.

**Net-worth snapshots.** `getTotals()` (`lib/finance.ts`) computes the live
figures; `recordSnapshot()` (`lib/actions/snapshots.ts`) upserts one row per day
into `NetWorthSnapshot`, called on dashboard load and after price refreshes so
the trend chart always has a current point.

**Stock prices are provider-pluggable.** `lib/stocks/index.ts` selects a
`StockProvider` from `STOCK_PROVIDER` env — `mock` (default, no key) or `finnhub`
(needs `FINNHUB_API_KEY`). Go through `getQuote`/`getQuotes`; `getQuotes`
throttles real requests (~1.1s apart) to respect the free tier.

**Pages** (`app/`): `/` dashboard · `/ledger` transactions · `/investments`
holdings · `/debt` liabilities · `/subscriptions` recurring · `/settings`
accounts. Shared UI primitives live in `components/ui/*`.

**Theming.** All colors are CSS-variable tokens defined in `app/globals.css`:
`:root` holds the light palette and `:root.dark` overrides it; `@theme inline`
maps each token to a Tailwind utility (`bg-card`, `text-foreground`, etc.), so
toggling the `dark` class on `<html>` re-themes the whole app with no component
changes — never hardcode hex colors. Theme is class-driven: an inline script in
`app/layout.tsx` sets `.dark` before paint (stored `localStorage.theme`, else OS
preference) to avoid a flash, and `components/theme-toggle.tsx` flips the class.
Recharts components must pass `var(--…)` into their style props (stroke, fill,
tooltip `contentStyle`/`itemStyle`) to follow the theme.

# Claude Code Project Rules — FinTrack

- Follow the data model and requirements in `FINANCE_APP_SPEC.md` strictly.
- **Money:** never use raw JS numbers for financial math. Use `decimal.js`
  via the helpers in `lib/money.ts` (`d`, `add`, `sub`, `mul`, `sum`,
  `fmtCurrency`). Prisma `Decimal` columns are the source of truth at rest.
- **Mutations:** use Server Actions in `lib/actions/*`. Each action calls
  `revalidatePath` for the pages it affects. Do not mutate from client fetch.
- **UI:** reuse the primitives in `components/ui/*` (Card, Button, Input,
  Select, Label, Badge, Progress, Table, Dialog). Match the existing Tailwind
  token style (`bg-card`, `text-muted-foreground`, `--accent`, etc.).
- **Stock prices:** go through `lib/stocks` (`getQuote` / `getQuotes`). The
  provider is selected by `STOCK_PROVIDER` env (`mock` default, `finnhub`
  optional). Respect free-tier rate limits — `getQuotes` already throttles
  real requests.
- **Transactions <-> balances:** account balances and liability balances are
  adjusted atomically inside `lib/actions/transactions.ts`. Any change to a
  transaction must reverse the old effect and apply the new one in one
  `prisma.$transaction`.
- Keep pages as Server Components; push interactivity into client components
  under `components/`.
