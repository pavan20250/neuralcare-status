import type { ServiceId, ServiceStatus } from "@/types/status";
import { classifyFromLatencyAndOk } from "@/lib/status-logic";
import { serverEnv } from "@/lib/env";

const REQUEST_TIMEOUT_MS = 12_000;

interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  readyState: string;
  state?: string;
  createdAt: number;
  buildingAt?: number;
  ready?: number;
  errorMessage?: string;
}

interface VercelDeploymentsResponse {
  deployments: VercelDeployment[];
}

export async function checkVercelHealth(): Promise<ServiceStatus> {
  const lastChecked = new Date().toISOString();
  const serviceId: ServiceId = "vercel";
  const token = serverEnv.vercelApiToken();
  const projectId = serverEnv.vercelProjectId();
  const teamId = serverEnv.vercelTeamId();

  if (!token || !projectId) {
    return {
      service: "Vercel Hosting",
      serviceId,
      status: "unknown",
      latency: null,
      uptime: null,
      lastChecked,
      message: "VERCEL_API_TOKEN or VERCEL_PROJECT_ID not configured",
    };
  }

  const params = new URLSearchParams({
    projectId,
    limit: "5",
    target: "production",
  });
  if (teamId) params.set("teamId", teamId);

  const url = `https://api.vercel.com/v6/deployments?${params.toString()}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const started = performance.now();
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    const latency = Math.round(performance.now() - started);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        service: "Vercel Hosting",
        serviceId,
        status: classifyFromLatencyAndOk({ ok: false, latencyMs: latency }),
        latency,
        uptime: null,
        lastChecked,
        message: `HTTP ${res.status}: ${text.slice(0, 200)}`,
      };
    }
    const body = (await res.json()) as VercelDeploymentsResponse;
    const latest = body.deployments?.[0];
    if (!latest) {
      return {
        service: "Vercel Hosting",
        serviceId,
        status: "degraded",
        latency,
        uptime: null,
        lastChecked,
        message: "No deployments returned",
      };
    }

    const error = latest.readyState === "ERROR" || latest.readyState === "CANCELED";
    const building = latest.readyState === "BUILDING" || latest.readyState === "INITIALIZING";
    const partialFailure = building;

    const uptime =
      body.deployments.length > 0
        ? Math.round(
            (body.deployments.filter((d) => d.readyState === "READY").length /
              body.deployments.length) *
              10000,
          ) / 100
        : null;

    return {
      service: "Vercel Hosting",
      serviceId,
      status: error
        ? "down"
        : latest.readyState === "READY" && !partialFailure
        ? "operational"
        : classifyFromLatencyAndOk({ ok: !error, latencyMs: latency, partialFailure }),
      latency,
      uptime,
      lastChecked,
      message: latest.errorMessage,
      meta: {
        latestDeployment: {
          id: latest.uid,
          url: latest.url,
          readyState: latest.readyState,
          createdAt: latest.createdAt,
        },
      },
    };
  } catch (e) {
    clearTimeout(timer);
    const latency = Math.round(performance.now() - started);
    const timedOut = (e as Error).name === "AbortError";
    return {
      service: "Vercel Hosting",
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
