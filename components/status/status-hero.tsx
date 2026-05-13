"use client";

import { motion } from "framer-motion";
import type { ServiceHealthStatus } from "@/types/status";
import { StatusDot } from "@/components/status/status-dot";
import { formatRelativeAgo } from "@/utils/time";
import { cn } from "@/lib/utils";

export function StatusHero({
  headline,
  overall,
  lastChecked,
  clientUptime,
  isValidating,
}: {
  headline: string;
  overall: ServiceHealthStatus;
  lastChecked: string;
  clientUptime: number | null;
  isValidating: boolean;
}) {
  const checked = new Date(lastChecked);

  return (
    <motion.section
      layout
      className="rounded-xl border border-border/70 bg-card/50 px-4 py-3.5 shadow-sm backdrop-blur-sm dark:bg-card/30"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <div className="min-w-0 flex items-start gap-2.5">
          <StatusDot status={overall} className="mt-1.5 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
              {headline}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Last updated{" "}
              <time dateTime={lastChecked}>{checked.toLocaleString()}</time>
              <span className="text-muted-foreground/80">
                {" "}
                ({formatRelativeAgo(lastChecked)})
              </span>
              {isValidating ? (
                <span className={cn("ml-1.5 text-foreground/70", "animate-pulse")}>
                  · updating
                </span>
              ) : null}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right sm:pt-0.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Overall
          </p>
          <p className="text-lg font-semibold tabular-nums leading-none text-foreground">
            {clientUptime === null ? "—" : `${clientUptime.toFixed(2)}%`}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
