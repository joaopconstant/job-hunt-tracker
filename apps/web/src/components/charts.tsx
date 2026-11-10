"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { STATUSES, STATUS_LABELS, type ApplicationStatus } from "@/lib/applications";
import { formatWeek, type Stats } from "@/lib/stats";

// One measure per chart, so one hue (no legend needed: the card title names the series).
const config = { count: { label: "Applications", color: "var(--chart-2)" } } satisfies ChartConfig;

export function WeeklyChart({ weekly }: { weekly: Stats["weekly"] }) {
  const data = weekly.map((week) => ({ week: formatWeek(week.weekStart), count: week.count }));

  return (
    <ChartContainer config={config} className="aspect-auto h-56 w-full">
      <BarChart data={data} margin={{ left: -20, right: 4 }} accessibilityLayer>
        <CartesianGrid vertical={false} strokeOpacity={0.5} />
        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={44} />
        <ChartTooltip cursor={{ fillOpacity: 0.4 }} content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ChartContainer>
  );
}

export function StatusChart({ byStatus }: { byStatus: Record<ApplicationStatus, number> }) {
  const data = STATUSES.map((status) => ({ status: STATUS_LABELS[status], count: byStatus[status] }));

  return (
    <ChartContainer config={config} className="aspect-auto h-56 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }} accessibilityLayer>
        <CartesianGrid horizontal={false} strokeOpacity={0.5} />
        <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="status" tickLine={false} axisLine={false} width={72} />
        <ChartTooltip cursor={{ fillOpacity: 0.4 }} content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} maxBarSize={24} />
      </BarChart>
    </ChartContainer>
  );
}
