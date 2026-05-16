import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Database,
  MessageSquare,
  Server,
  ShieldCheck,
} from "lucide-react";
import type { ServiceId } from "@/types/status";

export const serviceIcons: Record<ServiceId, LucideIcon> = {
  backend: Server,
  "supabase-database": Database,
  "supabase-auth": ShieldCheck,
  vercel: Cloud,
  "chat-engine": MessageSquare,
};
