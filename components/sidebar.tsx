"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  TrendingUp,
  Landmark,
  RefreshCw,
  Settings,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ledger", label: "Ledger", icon: ReceiptText },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/debt", label: "Debt", icon: Landmark },
  { href: "/subscriptions", label: "Subscriptions", icon: RefreshCw },
  { href: "/settings", label: "Accounts", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card px-3 py-5 md:flex">
      <div className="flex items-center gap-2 px-3 pb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Wallet className="h-5 w-5" />
        </div>
        <span className="text-base font-semibold">FinTrack</span>
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2">
        <ThemeToggle />
        <div className="px-3 text-xs text-muted-foreground">
          Personal Finance Tracker
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="scrollbar-thin flex gap-1 overflow-x-auto border-b border-border bg-card px-2 py-2 md:hidden">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              active ? "bg-accent/10 text-accent" : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
      <ThemeToggle showLabel={false} className="ml-auto shrink-0 px-2 py-1.5" />
    </nav>
  );
}
