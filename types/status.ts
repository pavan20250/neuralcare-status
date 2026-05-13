export type ServiceHealthStatus =
  | "operational"
  | "unstable"
  | "down"
  | "unknown";

export type ServiceId =
  | "gemini"
  | "backend"
  | "supabase-database"
  | "supabase-auth"
  | "vercel"
  | "chat-engine";

export interface ServiceStatus {
  service: string;
  serviceId: ServiceId;
  status: ServiceHealthStatus;
  latency: number | null;
  /** Percent 0–100 when derivable; null if not yet measured */
  uptime: number | null;
  lastChecked: string;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface AggregatedStatusResponse {
  overall: ServiceHealthStatus;
  lastChecked: string;
  services: ServiceStatus[];
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  startedAt: string;
  resolvedAt?: string;
  affectedServices: ServiceId[];
}
