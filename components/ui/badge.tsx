import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "muted" | "positive" | "negative" | "accent";

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary",
  muted: "bg-muted text-muted-foreground",
  positive: "bg-positive/10 text-positive",
  negative: "bg-negative/10 text-negative",
  accent: "bg-accent/10 text-accent",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
