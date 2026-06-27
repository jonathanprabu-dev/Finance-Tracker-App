import Decimal from "decimal.js";
import type { Prisma } from "@prisma/client";

// All financial math goes through decimal.js to avoid floating-point drift.
// Prisma returns Decimal values as Prisma.Decimal; we normalize everything to
// decimal.js Decimal here, then format/serialize at the boundary.

export type Money = Decimal;

// Accepts Prisma.Decimal, number, string, or Decimal and returns a Decimal.
export function d(value: Decimal.Value | Prisma.Decimal): Decimal {
  return new Decimal(value as Decimal.Value);
}

export function add(...values: (Decimal.Value | Prisma.Decimal)[]): Decimal {
  return values.reduce<Decimal>((acc, v) => acc.plus(d(v)), new Decimal(0));
}

export function sub(a: Decimal.Value | Prisma.Decimal, b: Decimal.Value | Prisma.Decimal): Decimal {
  return d(a).minus(d(b));
}

export function mul(a: Decimal.Value | Prisma.Decimal, b: Decimal.Value | Prisma.Decimal): Decimal {
  return d(a).times(d(b));
}

export function sum<T>(items: T[], pick: (item: T) => Decimal.Value | Prisma.Decimal): Decimal {
  return items.reduce<Decimal>((acc, item) => acc.plus(d(pick(item))), new Decimal(0));
}

// Convert a Decimal/Prisma.Decimal to a plain number for charts/serialization.
export function toNumber(value: Decimal.Value | Prisma.Decimal): number {
  return d(value).toNumber();
}

export function fmtCurrency(
  value: Decimal.Value | Prisma.Decimal,
  opts: { signed?: boolean; compact?: boolean } = {}
): string {
  const n = d(value);
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: opts.compact ? "compact" : "standard",
    maximumFractionDigits: 2,
  });
  const formatted = formatter.format(n.abs().toNumber());
  if (opts.signed) {
    if (n.isNegative()) return `-${formatted}`;
    if (n.isPositive()) return `+${formatted}`;
  } else if (n.isNegative()) {
    return `-${formatted}`;
  }
  return formatted;
}

export function fmtPercent(value: Decimal.Value | Prisma.Decimal, fractionDigits = 2): string {
  return `${d(value).toFixed(fractionDigits)}%`;
}

export function fmtShares(value: Decimal.Value | Prisma.Decimal): string {
  return d(value).toDecimalPlaces(4).toString();
}
