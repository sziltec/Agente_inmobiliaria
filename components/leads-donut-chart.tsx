"use client";

// Dona con la distribución de leads por estado de cualificación.
import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const statusLabels: Record<string, string> = {
  NEW: "Nuevos",
  QUALIFYING: "Cualificando",
  QUALIFIED: "Cualificados",
  DISQUALIFIED: "Descartados",
};

const statusColors: Record<string, string> = {
  NEW: "var(--chart-3)",
  QUALIFYING: "var(--chart-2)",
  QUALIFIED: "var(--chart-1)",
  DISQUALIFIED: "var(--chart-4)",
};

const chartConfig: ChartConfig = {
  NEW: { label: "Nuevos", color: "var(--chart-3)" },
  QUALIFYING: { label: "Cualificando", color: "var(--chart-2)" },
  QUALIFIED: { label: "Cualificados", color: "var(--chart-1)" },
  DISQUALIFIED: { label: "Descartados", color: "var(--chart-4)" },
};

export function LeadsDonutChart({
  leadsByStatus,
}: {
  leadsByStatus: Record<string, number>;
}) {
  const data = Object.entries(statusLabels).map(([status, label]) => ({
    status,
    label,
    value: leadsByStatus[status] ?? 0,
    fill: statusColors[status],
  }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Leads por estado</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative">
          <ChartContainer
            config={chartConfig}
            className="mx-auto h-[200px] w-[200px]"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="status"
                innerRadius={62}
                outerRadius={90}
                strokeWidth={3}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} stroke={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums">{total}</span>
            <span className="text-xs text-muted-foreground">leads totales</span>
          </div>
        </div>
        <div className="w-full space-y-2">
          {data.map((d) => (
            <div key={d.status} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: d.fill }}
                />
                {d.label}
              </span>
              <span className="font-medium tabular-nums">{d.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
