"use client";

// Tendencia de leads nuevos por día (últimos 30 días).
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig: ChartConfig = {
  count: { label: "Leads nuevos", color: "var(--chart-2)" },
};

export function NewLeadsTrendChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Leads nuevos</CardTitle>
        <p className="text-sm text-muted-foreground">Últimos 30 días · {total} en total</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <AreaChart data={data} margin={{ left: 0, right: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={4}
              tickFormatter={(value: string) =>
                new Date(value).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) =>
                    new Date(value as string).toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                    })
                  }
                />
              }
            />
            <Area
              dataKey="count"
              type="monotone"
              fill="var(--color-count)"
              fillOpacity={0.25}
              stroke="var(--color-count)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
