export function formatLatencyMs(ms: number | null) {
  if (ms === null) return "—";
  return `${ms} ms`;
}

export function formatUptimePercent(pct: number | null) {
  if (pct === null) return "—";
  return `${pct.toFixed(2)}%`;
}
