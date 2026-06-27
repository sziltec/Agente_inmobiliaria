"use client";

// Tasa de conversión a "cualificado" por canal.
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { channelNames } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig: ChartConfig = {
  rate: { label: "Conversión", color: "var(--chart-1)" },
};

export function ChannelConversionChart({
  data,
}: {
  data: { channel: string; total: number; qualified: number; rate: number }[];
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: channelNames[d.channel] || d.channel,
    ratePct: Math.round(d.rate * 100),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversión por canal</CardTitle>
        <p className="text-sm text-muted-foreground">% de leads que llegan a cualificados</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={chartData} margin={{ left: 0, right: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis hide />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => [
                    `${value}% (${item.payload.qualified}/${item.payload.total})`,
                    "Conversión",
                  ]}
                />
              }
            />
            <Bar dataKey="ratePct" fill="var(--color-rate)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
