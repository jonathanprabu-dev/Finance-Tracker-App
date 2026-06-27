import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  tone?: "default" | "positive" | "negative";
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <p
          className={cn(
            "mt-2 text-2xl font-semibold tracking-tight",
            tone === "positive" && "text-positive",
            tone === "negative" && "text-negative"
          )}
        >
          {value}
        </p>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}
