"use client";

import { motion } from "framer-motion";
import type { ServiceHealthStatus } from "@/types/status";
import { cn } from "@/lib/utils";

const colors: Record<ServiceHealthStatus, string> = {
  operational: "bg-success shadow-[0_0_0_6px] shadow-success/25",
  degraded: "bg-warning shadow-[0_0_0_6px] shadow-warning/25",
  down: "bg-destructive shadow-[0_0_0_6px] shadow-destructive/25",
  unknown: "bg-muted-foreground shadow-[0_0_0_6px] shadow-muted/30",
};

export function StatusDot({
  status,
  className,
}: {
  status: ServiceHealthStatus;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex h-3 w-3", className)}>
      <motion.span
        layout
        className={cn(
          "inline-flex h-3 w-3 rounded-full",
          colors[status],
          status === "operational" ? "status-pulse" : "",
        )}
        aria-hidden
      />
    </span>
  );
}
