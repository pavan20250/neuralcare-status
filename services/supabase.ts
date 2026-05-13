import { createClient } from "@supabase/supabase-js";
import type { ServiceId, ServiceStatus } from "@/types/status";
import { classifyFromLatencyAndOk } from "@/lib/status-logic";
import { serverEnv } from "@/lib/env";

const REQUEST_TIMEOUT_MS = 12_000;

async function checkAuthHealth(
  supabaseUrl: string,
  apiKey?: string,
): Promise<{ latency: number; ok: boolean; message?: string }> {
  const healthUrl = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/health`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const started = performance.now();
  try {
    const headers: HeadersInit = apiKey ? { apikey: apiKey } : {};
    const res = await fetch(healthUrl, { signal: controller.signal, cache: "no-store", headers });
    clearTimeout(timer);
    const latency = Math.round(performance.now() - started);
    if (!res.ok) {
      return { latency, ok: false, message: `HTTP ${res.status}` };
    }
    const body = (await res.json().catch(() => null)) as { version?: string } | null;
    return {
      latency,
      ok: Boolean(body && typeof body === "object"),
      message: !body ? "Invalid auth health payload" : undefined,
    };
  } catch (e) {
    clearTimeout(timer);
    return {
      latency: Math.round(performance.now() - started),
      ok: false,
      message: (e as Error).message,
    };
  }
}

async function checkDatabaseHealth(
  supabaseUrl: string,
  serviceKey: string,
  table?: string,
): Promise<{ latency: number; ok: boolean; partialFailure?: boolean; message?: string }> {
  const started = performance.now();

  try {
    if (table) {
      const client = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { fetch: (...args) => fetch(...args) },
      });
      const result = await Promise.race([
        client.from(table).select("*", { count: "exact", head: true }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), REQUEST_TIMEOUT_MS),
        ),
      ]);
      const latency = Math.round(performance.now() - started);
      const err = result.error;
      if (err) {
        return {
          latency,
          ok: false,
          message: err.message,
        };
      }
      return { latency, ok: true };
    }

    const restUrl = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const res = await fetch(restUrl, {
      method: "GET",
      headers: {
        apikey: serviceKey,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    const latency = Math.round(performance.now() - started);
    // 401 = service is up but anon key lacks REST access; treat as unstable, not down
    const reachable = res.ok || res.status === 401;
    const partialFailure = reachable && !res.ok;
    return {
      latency,
      ok: reachable,
      partialFailure,
      message: res.status === 401
        ? "Add service_role key for full DB checks (Supabase → Settings → API)"
        : !res.ok
        ? `HTTP ${res.status}`
        : undefined,
    };
  } catch (e) {
    const msg = (e as Error).message;
    return {
      latency: Math.round(performance.now() - started),
      ok: false,
      message: msg === "timeout" ? "timeout" : msg,
    };
  }
}

export async function checkSupabaseDatabase(): Promise<ServiceStatus> {
  const lastChecked = new Date().toISOString();
  const serviceId: ServiceId = "supabase-database";
  const url = serverEnv.supabaseUrl();
  const key = serverEnv.supabaseServiceRoleKey();
  if (!url || !key) {
    return {
      service: "Supabase Database",
      serviceId,
      status: "unknown",
      latency: null,
      uptime: null,
      lastChecked,
      message: "Supabase URL or service role key not configured",
    };
  }
  const table = serverEnv.supabaseHealthTable();
  const result = await checkDatabaseHealth(url, key, table);
  return {
    service: "Supabase Database",
    serviceId,
    status: classifyFromLatencyAndOk({
      ok: result.ok,
      latencyMs: result.latency,
      partialFailure: result.partialFailure,
      timedOut: result.message === "timeout",
    }),
    latency: result.latency,
    uptime: null,
    lastChecked,
    message: result.message,
    meta: { table: table ?? null },
  };
}

export async function checkSupabaseAuth(): Promise<ServiceStatus> {
  const lastChecked = new Date().toISOString();
  const serviceId: ServiceId = "supabase-auth";
  const url = serverEnv.supabaseUrl();
  const key = serverEnv.supabaseServiceRoleKey();
  if (!url) {
    return {
      service: "Supabase Auth",
      serviceId,
      status: "unknown",
      latency: null,
      uptime: null,
      lastChecked,
      message: "NEXT_PUBLIC_SUPABASE_URL is not configured",
    };
  }
  const result = await checkAuthHealth(url, key);
  return {
    service: "Supabase Auth",
    serviceId,
    status: classifyFromLatencyAndOk({
      ok: result.ok,
      latencyMs: result.latency,
    }),
    latency: result.latency,
    uptime: null,
    lastChecked,
    message: result.message,
  };
}

export async function checkSupabaseBundle(): Promise<{
  database: ServiceStatus;
  auth: ServiceStatus;
}> {
  const [database, auth] = await Promise.all([
    checkSupabaseDatabase(),
    checkSupabaseAuth(),
  ]);
  return { database, auth };
}
