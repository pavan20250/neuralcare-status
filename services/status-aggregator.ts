import type { AggregatedStatusResponse, ServiceStatus } from "@/types/status";
import { worstStatus } from "@/lib/status-logic";
import { checkBackendHealth } from "@/services/backend";
import { checkSupabaseBundle } from "@/services/supabase";
import { checkVercelHealth } from "@/services/vercel";
import { checkChatEngineHealth } from "@/services/chat-engine";

export async function getAggregatedStatus(): Promise<AggregatedStatusResponse> {
  const [
    backend,
    supabase,
    vercel,
    chatEngine,
  ] = await Promise.all([
    checkBackendHealth(),
    checkSupabaseBundle(),
    checkVercelHealth(),
    checkChatEngineHealth(),
  ]);

  const services: ServiceStatus[] = [
    backend,
    supabase.database,
    supabase.auth,
    vercel,
    chatEngine,
  ];

  const overall = worstStatus(services.map((s) => s.status));
  const lastChecked = new Date(
    Math.max(...services.map((s) => new Date(s.lastChecked).getTime())),
  ).toISOString();

  return { overall, lastChecked, services };
}
