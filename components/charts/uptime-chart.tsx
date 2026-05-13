"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface UptimeChartPoint {
  t: string;
  uptime: number;
}

export function UptimeChart({ data }: { data: UptimeChartPoint[] }) {
  return (
    <Card className="glass-panel border-border/50 bg-card/40 dark:bg-card/25">
      <CardHeader className="px-4 pb-1 pt-3">
        <CardTitle className="text-xs font-semibold text-foreground/80">
          Uptime
        </CardTitle>
      </CardHeader>
      <CardContent className="h-36 px-2 pb-2 pt-0 sm:h-40 sm:px-3">
        {data.length < 2 ? (
          <div className="flex h-full items-center justify-center px-2 text-center text-[11px] text-muted-foreground">
            Collecting samples…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="uptimeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="t"
                tickFormatter={(v) =>
                  new Date(v).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                width={28}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  fontSize: 11,
                }}
                labelFormatter={(v) => new Date(v as string).toLocaleString()}
                formatter={(value: number) => [`${value.toFixed(2)}%`, "Uptime"]}
              />
              <Area
                type="monotone"
                dataKey="uptime"
                stroke="hsl(var(--success))"
                strokeWidth={1.5}
                fill="url(#uptimeFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
