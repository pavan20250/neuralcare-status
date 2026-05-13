import type { ServiceId, ServiceStatus } from "@/types/status";
import { classifyFromLatencyAndOk } from "@/lib/status-logic";
import { serverEnv } from "@/lib/env";

const REQUEST_TIMEOUT_MS = 12_000;

export async function checkChatEngineHealth(): Promise<ServiceStatus> {
  const lastChecked = new Date().toISOString();
  const serviceId: ServiceId = "chat-engine";
  const url = serverEnv.chatEngineHealthUrl();

  if (!url) {
    return {
      service: "AI Chat Engine",
      serviceId,
      status: "unknown",
      latency: null,
      uptime: null,
      lastChecked,
      message: "CHAT_ENGINE_HEALTH_URL is not configured",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const started = performance.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);
    const latency = Math.round(performance.now() - started);
    const ok = res.ok;
    let partialFailure = false;
    if (ok) {
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("json")) {
        const json = await res.json().catch(() => null);
        partialFailure = json === null;
      }
    }
    return {
      service: "AI Chat Engine",
      serviceId,
      status: classifyFromLatencyAndOk({
        ok,
        latencyMs: latency,
        partialFailure,
      }),
      latency,
      uptime: null,
      lastChecked,
      message: !ok ? `HTTP ${res.status}` : undefined,
      meta: { url },
    };
  } catch (e) {
    clearTimeout(timer);
    const latency = Math.round(performance.now() - started);
    const timedOut = (e as Error).name === "AbortError";
    return {
      service: "AI Chat Engine",
      serviceId,
      status: classifyFromLatencyAndOk({
        ok: false,
        latencyMs: latency,
        timedOut,
      }),
      latency,
      uptime: null,
      lastChecked,
      message: (e as Error).message,
      meta: { url },
    };
  }
}
