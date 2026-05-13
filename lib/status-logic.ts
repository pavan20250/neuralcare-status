import type { ServiceHealthStatus } from "@/types/status";

export function classifyFromLatencyAndOk(opts: {
  ok: boolean;
  latencyMs: number | null;
  partialFailure?: boolean;
  timedOut?: boolean;
}): ServiceHealthStatus {
  if (opts.timedOut || !opts.ok) return "down";
  if (opts.partialFailure) return "degraded";
  const latency = opts.latencyMs;
  if (latency === null) return "unknown";
  if (latency < 500) return "operational";
  if (latency > 1000) return "degraded";
  return "degraded";
}

export function worstStatus(
  statuses: ServiceHealthStatus[],
): ServiceHealthStatus {
  if (statuses.includes("down")) return "down";
  if (statuses.includes("degraded")) return "degraded";
  if (statuses.includes("unknown")) return "unknown";
  return "operational";
}
