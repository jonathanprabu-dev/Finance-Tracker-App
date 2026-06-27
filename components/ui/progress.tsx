import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName,
}: {
  value: number; // 0 - 100
  className?: string;
  indicatorClassName?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full bg-accent transition-all", indicatorClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
