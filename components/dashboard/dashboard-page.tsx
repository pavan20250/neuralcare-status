"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import type { AggregatedStatusResponse } from "@/types/status";
import { StatusHero } from "@/components/status/status-hero";
import { StatusCard } from "@/components/status/status-card";
import { UptimeChart, type UptimeChartPoint } from "@/components/charts/uptime-chart";
import { LatencyChart, type LatencyChartPoint } from "@/components/charts/latency-chart";
import { LoadingSkeleton } from "@/components/status/loading-skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

async function jsonFetcher(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

function scoreService(
  s: AggregatedStatusResponse["services"][number],
): number | null {
  if (s.status === "operational") return 100;
  if (s.status === "unstable") return 50;
  if (s.status === "down") return 0;
  return null;
}

function computeCompositeUptime(services: AggregatedStatusResponse["services"]) {
  const scores = services
    .map(scoreService)
    .filter((v): v is number => v !== null);
  if (!scores.length) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function statusHeadline(services: AggregatedStatusResponse["services"]) {
  const total = services.length;
  const bad = services.filter(
    (s) => s.status === "down" || s.status === "unstable",
  ).length;
  const ok = services.filter((s) => s.status === "operational").length;
  if (bad > 0) {
    return `Some systems not operational (${bad} of ${total})`;
  }
  if (ok === total) {
    return `All systems operational (${ok}/${total})`;
  }
  return `Partial status (${ok}/${total} operational)`;
}

export function DashboardPage({
  refreshMs,
  appName,
}: {
  refreshMs: number;
  appName: string;
}) {
  const { data, error, isLoading, isValidating } = useSWR<AggregatedStatusResponse>(
    "/api/status",
    jsonFetcher,
    {
      refreshInterval: refreshMs,
      revalidateOnFocus: true,
    },
  );

  const [uptimeSeries, setUptimeSeries] = useState<UptimeChartPoint[]>([]);
  const [latencySeries, setLatencySeries] = useState<LatencyChartPoint[]>([]);

  useEffect(() => {
    if (!data) return;
    const composite = computeCompositeUptime(data.services);
    if (composite === null) return;
    setUptimeSeries((prev) =>
      [...prev, { t: data.lastChecked, uptime: composite }].slice(-60),
    );

    const latencies = data.services
      .map((s) => s.latency)
      .filter((n): n is number => typeof n === "number");
    if (!latencies.length) return;
    const avgLatency =
      latencies.reduce((sum, n) => sum + n, 0) / latencies.length;
    setLatencySeries((prev) =>
      [...prev, { t: data.lastChecked, avgLatency }].slice(-60),
    );
  }, [data]);

  const clientUptime = useMemo(() => {
    if (!data) return null;
    return computeCompositeUptime(data.services);
  }, [data]);

  if (isLoading && !data) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-5">
        <header className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight">{appName}</h2>
          <ThemeToggle />
        </header>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-5">
        <p className="text-sm font-medium text-destructive">Unable to load status</p>
        <pre className="mt-2 overflow-x-auto rounded-lg border border-border/60 bg-muted/30 p-2 text-[11px] text-muted-foreground">
          {(error as Error)?.message ?? "Unknown error"}
        </pre>
      </div>
    );
  }

  const headline = statusHeadline(data.services);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold tracking-tight">{appName}</h2>
          <p className="text-[11px] text-muted-foreground">
            Auto refresh · {Math.round(refreshMs / 1000)}s
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="space-y-4">
        <StatusHero
          headline={headline}
          overall={data.overall}
          lastChecked={data.lastChecked}
          clientUptime={clientUptime}
          isValidating={isValidating}
        />

        <div className="flex flex-col gap-1.5">
          {data.services.map((service) => (
            <StatusCard key={service.serviceId} service={service} />
          ))}
        </div>

        <section className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <UptimeChart data={uptimeSeries} />
          <LatencyChart data={latencySeries} />
        </section>


      </div>
    </div>
  );
}
