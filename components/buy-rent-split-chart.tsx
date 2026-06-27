"use client";

// Compra vs alquiler entre los leads que indicaron operación.
import { Cell, Pie, PieChart } from "recharts";
import { operationNames } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const colors: Record<string, string> = {
  BUY: "var(--chart-1)",
  RENT: "var(--chart-2)",
};

const chartConfig: ChartConfig = {
  BUY: { label: "Compra", color: "var(--chart-1)" },
  RENT: { label: "Alquiler", color: "var(--chart-2)" },
};

export function BuyRentSplitChart({ counts }: { counts: Record<string, number> }) {
  const data = Object.entries(operationNames).map(([operation, label]) => ({
    operation,
    label,
    value: counts[operation] ?? 0,
    fill: colors[operation],
  }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Compra vs alquiler</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="mx-auto h-[180px] w-[180px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="operation" hideLabel />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="operation"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={3}
                >
                  {data.map((entry) => (
                    <Cell key={entry.operation} fill={entry.fill} stroke={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="w-full space-y-2">
              {data.map((d) => (
                <div key={d.operation} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2 rounded-full" style={{ backgroundColor: d.fill }} />
                    {d.label}
                  </span>
                  <span className="font-medium tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
