import type { ServiceHealthStatus } from "@/types/status";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const labels: Record<ServiceHealthStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
  unknown: "Unknown",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ServiceHealthStatus;
  className?: string;
}) {
  const variant =
    status === "operational"
      ? "success"
      : status === "degraded"
        ? "warning"
        : status === "down"
          ? "destructive"
          : "default";

  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      {labels[status]}
    </Badge>
  );
}
