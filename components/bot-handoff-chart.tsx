"use client";

// Proporción de conversaciones que pasaron a manos de un humano vs las que
// sigue manejando el bot.
import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig: ChartConfig = {
  bot: { label: "Bot", color: "var(--chart-1)" },
  human: { label: "Humano", color: "var(--chart-4)" },
};

export function BotHandoffChart({
  total,
  handedOff,
}: {
  total: number;
  handedOff: number;
}) {
  const bot = total - handedOff;
  const data = [
    { key: "bot", label: "Bot", value: bot, fill: "var(--chart-1)" },
    { key: "human", label: "Humano", value: handedOff, fill: "var(--chart-4)" },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Handoff a humano</CardTitle>
        <p className="text-sm text-muted-foreground">
          {total ? Math.round((handedOff / total) * 100) : 0}% de las conversaciones
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <ChartContainer config={chartConfig} className="mx-auto h-[180px] w-[180px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
            <Pie data={data} dataKey="value" nameKey="key" innerRadius={50} outerRadius={80} strokeWidth={3}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} stroke={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="w-full space-y-2">
          {data.map((d) => (
            <div key={d.key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: d.fill }} />
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
