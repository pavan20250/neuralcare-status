function readEnv(key: string): string | undefined {
  const v = process.env[key];
  if (v === undefined || v === "") return undefined;
  return v;
}

export const serverEnv = {
  geminiApiKey: () => readEnv("GEMINI_API_KEY"),
  geminiModel: () => readEnv("GEMINI_MODEL") ?? "gemini-2.5-flash",
  backendApiUrl: () => readEnv("BACKEND_API_URL"),
  backendHealthEndpoint: () => {
    const ep = readEnv("BACKEND_HEALTH_ENDPOINT");
    if (!ep) return "/health";
    return ep.startsWith("/") ? ep : `/${ep}`;
  },
  supabaseUrl: () => readEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseServiceRoleKey: () => readEnv("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseHealthTable: () => readEnv("SUPABASE_HEALTH_TABLE"),
  vercelApiToken: () => readEnv("VERCEL_API_TOKEN"),
  vercelProjectId: () => readEnv("VERCEL_PROJECT_ID"),
  vercelTeamId: () => readEnv("VERCEL_TEAM_ID"),
  chatEngineHealthUrl: () => readEnv("CHAT_ENGINE_HEALTH_URL"),
};

export const publicEnv = {
  appName: () => process.env.NEXT_PUBLIC_APP_NAME ?? "NeuralCare AI",
  refreshInterval: () => {
    const raw = process.env.STATUS_REFRESH_INTERVAL ?? "30000";
    const n = Number(raw);
    return Number.isFinite(n) && n >= 5000 ? n : 30000;
  },
};
