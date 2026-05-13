import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Database,
  MessageSquare,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ServiceId } from "@/types/status";

export const serviceIcons: Record<ServiceId, LucideIcon> = {
  gemini: Sparkles,
  backend: Server,
  "supabase-database": Database,
  "supabase-auth": ShieldCheck,
  vercel: Cloud,
  "chat-engine": MessageSquare,
};
