"use client";

// Lightweight inline sparkline. We don't persist per-stock price history, so we
// synthesize a smooth, deterministic series from the ticker + current price to
// give a sense of recent movement. Color reflects up/down vs. the start.
export function Sparkline({
  seed,
  points = 16,
  up,
  className,
}: {
  seed: string;
  points?: number;
  up: boolean;
  className?: string;
}) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100000;

  const values: number[] = [];
  let v = 50;
  for (let i = 0; i < points; i++) {
    h = (h * 1103515245 + 12345) % 2147483648;
    const noise = (h / 2147483648) * 2 - 1; // -1..1
    const trend = up ? 0.6 : -0.6;
    v = Math.max(5, Math.min(95, v + noise * 8 + trend));
    values.push(v);
  }

  const w = 90;
  const hgt = 28;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const coords = values.map((val, i) => {
    const x = (i / (points - 1)) * w;
    const y = hgt - ((val - min) / range) * hgt;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const color = up ? "var(--positive)" : "var(--negative)";

  return (
    <svg width={w} height={hgt} className={className} viewBox={`0 0 ${w} ${hgt}`}>
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
