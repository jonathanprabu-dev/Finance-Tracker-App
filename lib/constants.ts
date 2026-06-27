export const LOAN_PAYMENT_CATEGORY = "Loan Payment";

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Food",
  "Utilities",
  "Internet",
  "Transport",
  "Shopping",
  "Entertainment",
  "Subscription",
  "Healthcare",
  "Insurance",
  LOAN_PAYMENT_CATEGORY,
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Dividends",
  "Interest",
  "Gift",
  "Other",
] as const;

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CHECKING: "Checking",
  SAVINGS: "Savings",
  CASH: "Cash",
};

export const LIABILITY_TYPE_LABELS: Record<string, string> = {
  LOAN: "Loan",
  CREDIT_CARD: "Credit Card",
};

// Stable palette for category pie slices.
export const CHART_COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#64748b",
];
