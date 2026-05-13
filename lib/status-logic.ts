import type { ServiceHealthStatus } from "@/types/status";

export function classifyFromLatencyAndOk(opts: {
  ok: boolean;
  latencyMs: number | null;
  partialFailure?: boolean;
  timedOut?: boolean;
}): ServiceHealthStatus {
  if (opts.timedOut || !opts.ok) return "down";
  if (opts.partialFailure) return "unstable";
  const latency = opts.latencyMs;
  if (latency === null) return "unknown";
  if (latency < 500) return "operational";
  if (latency > 1000) return "unstable";
  return "unstable";
}

export function worstStatus(
  statuses: ServiceHealthStatus[],
): ServiceHealthStatus {
  if (statuses.includes("down")) return "down";
  if (statuses.includes("unstable")) return "unstable";
  if (statuses.includes("unknown")) return "unknown";
  return "operational";
}
