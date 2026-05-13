import type { ServiceId, ServiceStatus } from "@/types/status";
import { classifyFromLatencyAndOk } from "@/lib/status-logic";
import { serverEnv } from "@/lib/env";

const REQUEST_TIMEOUT_MS = 12_000;

export async function checkGeminiHealth(): Promise<ServiceStatus> {
  const lastChecked = new Date().toISOString();
  const serviceId: ServiceId = "gemini";
  const apiKey = serverEnv.geminiApiKey();
  const model = serverEnv.geminiModel();

  if (!apiKey) {
    return {
      service: "Gemini API",
      serviceId,
      status: "unknown",
      latency: null,
      uptime: null,
      lastChecked,
      message: "GEMINI_API_KEY is not configured",
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const started = performance.now();
  let timedOut = false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: "ping" }],
          },
        ],
        generationConfig: { maxOutputTokens: 1 },
      }),
    });
    clearTimeout(timer);
    const latency = Math.round(performance.now() - started);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        service: "Gemini API",
        serviceId,
        status: classifyFromLatencyAndOk({
          ok: false,
          latencyMs: latency,
        }),
        latency,
        uptime: null,
        lastChecked,
        message: `HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`,
      };
    }
    const json = (await res.json()) as { candidates?: unknown[] };
    const partialFailure = !json?.candidates?.length;
    return {
      service: "Gemini API",
      serviceId,
      status: classifyFromLatencyAndOk({
        ok: true,
        latencyMs: latency,
        partialFailure,
      }),
      latency,
      uptime: null,
      lastChecked,
      message: partialFailure ? "Unexpected model response" : undefined,
      meta: { model },
    };
  } catch (e) {
    clearTimeout(timer);
    const latency = Math.round(performance.now() - started);
    if ((e as Error).name === "AbortError") timedOut = true;
    return {
      service: "Gemini API",
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
    };
  }
}
