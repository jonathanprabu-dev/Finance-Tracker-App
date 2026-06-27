import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date;
}

async function main() {
  console.log("Seeding database...");

  // Clear existing data (idempotent re-seed)
  await prisma.netWorthSnapshot.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.liability.deleteMany();
  await prisma.account.deleteMany();

  // --- Accounts ---
  const checking = await prisma.account.create({
    data: { name: "Everyday Checking", type: "CHECKING", balance: "8450.25" },
  });
  const savings = await prisma.account.create({
    data: { name: "High-Yield Savings", type: "SAVINGS", balance: "22000.00" },
  });
  const wallet = await prisma.account.create({
    data: { name: "Cash Wallet", type: "CASH", balance: "320.00" },
  });

  // --- Liabilities ---
  const homeLoan = await prisma.liability.create({
    data: {
      name: "Home Loan",
      type: "LOAN",
      totalBalance: "284000.00",
      originalBalance: "320000.00",
      interestRate: "5.85",
      monthlyMinPayment: "2100.00",
    },
  });
  const chaseCc = await prisma.liability.create({
    data: {
      name: "Chase Sapphire CC",
      type: "CREDIT_CARD",
      totalBalance: "2450.75",
      originalBalance: "5000.00",
      interestRate: "21.99",
      monthlyMinPayment: "120.00",
    },
  });
  const carLoan = await prisma.liability.create({
    data: {
      name: "Car Loan",
      type: "LOAN",
      totalBalance: "9800.00",
      originalBalance: "28000.00",
      interestRate: "4.20",
      monthlyMinPayment: "450.00",
    },
  });

  // --- Stocks ---
  await prisma.stock.createMany({
    data: [
      { ticker: "AAPL", sharesOwned: "25", avgBuyPrice: "150.10", lastPrice: "189.45", lastUpdated: new Date() },
      { ticker: "VOO", sharesOwned: "40", avgBuyPrice: "380.00", lastPrice: "452.30", lastUpdated: new Date() },
      { ticker: "MSFT", sharesOwned: "15", avgBuyPrice: "310.50", lastPrice: "418.20", lastUpdated: new Date() },
      { ticker: "TSLA", sharesOwned: "10", avgBuyPrice: "265.00", lastPrice: "242.10", lastUpdated: new Date() },
      { ticker: "NVDA", sharesOwned: "8", avgBuyPrice: "420.00", lastPrice: "880.50", lastUpdated: new Date() },
    ],
  });

  // --- Transactions (last ~2 months) ---
  type Tx = {
    date: Date;
    amount: string;
    type: "INCOME" | "EXPENSE";
    category: string;
    isRecurring?: boolean;
    note?: string;
    accountId?: string;
    liabilityId?: string;
  };

  const txns: Tx[] = [
    // Income
    { date: daysAgo(1), amount: "5200.00", type: "INCOME", category: "Salary", isRecurring: true, accountId: checking.id, note: "Monthly paycheck" },
    { date: daysAgo(31), amount: "5200.00", type: "INCOME", category: "Salary", isRecurring: true, accountId: checking.id },
    { date: daysAgo(12), amount: "450.00", type: "INCOME", category: "Freelance", accountId: checking.id },
    { date: daysAgo(20), amount: "85.40", type: "INCOME", category: "Dividends", accountId: savings.id },

    // Recurring expenses (subscriptions / bills)
    { date: daysAgo(2), amount: "1800.00", type: "EXPENSE", category: "Rent", isRecurring: true, accountId: checking.id },
    { date: daysAgo(3), amount: "15.99", type: "EXPENSE", category: "Subscription", isRecurring: true, accountId: checking.id, note: "Netflix" },
    { date: daysAgo(4), amount: "10.99", type: "EXPENSE", category: "Subscription", isRecurring: true, accountId: checking.id, note: "Spotify" },
    { date: daysAgo(5), amount: "52.00", type: "EXPENSE", category: "Utilities", isRecurring: true, accountId: checking.id, note: "Electric" },
    { date: daysAgo(6), amount: "70.00", type: "EXPENSE", category: "Internet", isRecurring: true, accountId: checking.id },

    // Variable expenses
    { date: daysAgo(2), amount: "120.35", type: "EXPENSE", category: "Food", accountId: checking.id, note: "Groceries" },
    { date: daysAgo(7), amount: "64.20", type: "EXPENSE", category: "Food", accountId: wallet.id, note: "Dining out" },
    { date: daysAgo(9), amount: "45.00", type: "EXPENSE", category: "Transport", accountId: wallet.id, note: "Gas" },
    { date: daysAgo(11), amount: "210.00", type: "EXPENSE", category: "Shopping", accountId: checking.id },
    { date: daysAgo(14), amount: "88.50", type: "EXPENSE", category: "Food", accountId: checking.id, note: "Groceries" },
    { date: daysAgo(18), amount: "32.00", type: "EXPENSE", category: "Entertainment", accountId: wallet.id },

    // Loan payments (linked to liabilities)
    { date: daysAgo(8), amount: "2100.00", type: "EXPENSE", category: "Loan Payment", accountId: checking.id, liabilityId: homeLoan.id, note: "Mortgage" },
    { date: daysAgo(10), amount: "450.00", type: "EXPENSE", category: "Loan Payment", accountId: checking.id, liabilityId: carLoan.id, note: "Car payment" },
    { date: daysAgo(15), amount: "300.00", type: "EXPENSE", category: "Loan Payment", accountId: checking.id, liabilityId: chaseCc.id, note: "CC payment" },
  ];

  for (const t of txns) {
    await prisma.transaction.create({ data: t });
  }

  // --- Net worth snapshots (last 30 days, gently trending up) ---
  const baseNet = 95000;
  for (let i = 30; i >= 0; i--) {
    const drift = (30 - i) * 380 + Math.round((Math.random() - 0.5) * 600);
    const netWorth = baseNet + drift;
    const cash = 30000 + Math.round((Math.random() - 0.5) * 400);
    const stockValue = 42000 + (30 - i) * 120 + Math.round((Math.random() - 0.5) * 800);
    const liabilities = cash + stockValue - netWorth;
    const date = daysAgo(i);
    date.setHours(0, 0, 0, 0);
    await prisma.netWorthSnapshot.create({
      data: {
        date,
        cash: cash.toString(),
        stockValue: stockValue.toString(),
        liabilities: liabilities.toString(),
        netWorth: netWorth.toString(),
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
