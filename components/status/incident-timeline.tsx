"use client";

import { motion } from "framer-motion";
import type { Incident } from "@/types/status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const incidentBadge: Record<
  Incident["status"],
  "default" | "warning" | "success" | "destructive"
> = {
  investigating: "warning",
  identified: "warning",
  monitoring: "default",
  resolved: "success",
};

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

export function IncidentTimeline({
  incidents,
  showArchiveLink = true,
  maxItems,
}: {
  incidents: Incident[];
  showArchiveLink?: boolean;
  maxItems?: number;
}) {
  const items =
    maxItems !== undefined ? incidents.slice(0, maxItems) : incidents;
  return (
    <Card className="glass-panel border-border/50 bg-card/40 dark:bg-card/25">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 px-4 py-3">
        <CardTitle className="text-sm font-semibold">Incidents</CardTitle>
        {showArchiveLink ? (
          <Link
            href="/incidents"
            className="text-[11px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            View all
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        {incidents.length === 0 ? (
          <p className="text-xs text-muted-foreground">No incidents.</p>
        ) : (
          <ol className="space-y-3">
            {items.map((inc, idx) => (
              <motion.li
                key={inc.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="border-b border-border/40 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant={incidentBadge[inc.status]}
                    className="px-1.5 py-0 text-[10px]"
                  >
                    {inc.status}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(inc.startedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium leading-snug">{inc.title}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {truncate(inc.description, 120)}
                </p>
              </motion.li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
