"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import { StatusDot } from "@/components/status/status-dot";
import type { ServiceStatus } from "@/types/status";
import { serviceIcons } from "@/lib/service-icons";
import { cn } from "@/lib/utils";
import { formatLatencyMs, formatUptimePercent } from "@/utils/formatting";

function vercelSubtitle(meta: ServiceStatus["meta"]): string | null {
  if (!meta || typeof meta !== "object") return null;
  const latest = meta.latestDeployment as
    | { readyState?: string; url?: string }
    | undefined;
  if (!latest?.readyState) return null;
  const host = latest.url?.replace(/^https?:\/\//, "") ?? "";
  return host ? `${latest.readyState} · ${host}` : latest.readyState;
}

export function StatusCard({
  service,
  className,
}: {
  service: ServiceStatus;
  className?: string;
}) {
  const Icon = serviceIcons[service.serviceId];
  const subtitle =
    service.serviceId === "vercel"
      ? vercelSubtitle(service.meta)
      : service.message ?? null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(className)}
    >
      <Card className="glass-panel border-border/50 bg-card/40 dark:bg-card/25">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-x-2 gap-y-0.5 px-3 py-2 sm:gap-x-3 sm:px-3.5 sm:py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/45 ring-1 ring-border/50 sm:h-9 sm:w-9 sm:rounded-lg">
            <Icon className="h-3.5 w-3.5 text-foreground/75 sm:h-4 sm:w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-tight">{service.service}</p>
            {subtitle ? (
              <p className="truncate text-[11px] leading-tight text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
          <span className="w-[3.25rem] shrink-0 text-right text-[11px] tabular-nums text-muted-foreground sm:w-16 sm:text-xs">
            {formatLatencyMs(service.latency)}
          </span>
          <span className="w-[3.25rem] shrink-0 text-right text-[11px] font-medium tabular-nums text-foreground/85 sm:w-16 sm:text-xs">
            {formatUptimePercent(service.uptime)}
          </span>
          <div className="flex w-[4.5rem] shrink-0 items-center justify-end gap-1.5 sm:w-auto sm:min-w-[5.5rem]">
            <StatusDot status={service.status} className="hidden sm:inline-flex" />
            <StatusBadge status={service.status} className="px-2 py-0 text-[10px]" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
