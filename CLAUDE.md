@AGENTS.md

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
