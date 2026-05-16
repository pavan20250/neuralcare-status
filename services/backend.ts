import type { ServiceId, ServiceStatus } from "@/types/status";
import { classifyFromLatencyAndOk } from "@/lib/status-logic";
import { serverEnv } from "@/lib/env";

const REQUEST_TIMEOUT_MS = 12_000;

export async function checkBackendHealth(): Promise<ServiceStatus> {
  const lastChecked = new Date().toISOString();
  const serviceId: ServiceId = "backend";
  const base = serverEnv.backendApiUrl()?.replace(/\/$/, "");
  const path = serverEnv.backendHealthEndpoint();

  if (!base) {
    return {
      service: "Gemini Backend API",
      serviceId,
      status: "unknown",
      latency: null,
      uptime: null,
      lastChecked,
      message: "BACKEND_API_URL is not configured",
    };
  }

  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const started = performance.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    clearTimeout(timer);
    const latency = Math.round(performance.now() - started);
    const ok = res.ok;
    return {
      service: "Gemini Backend API",
      serviceId,
      status: classifyFromLatencyAndOk({ ok, latencyMs: latency }),
      latency,
      uptime: null,
      lastChecked,
      message: !res.ok ? `HTTP ${res.status}` : undefined,
      meta: { url },
    };
  } catch (e) {
    clearTimeout(timer);
    const latency = Math.round(performance.now() - started);
    const timedOut = (e as Error).name === "AbortError";
    return {
      service: "Gemini Backend API",
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
