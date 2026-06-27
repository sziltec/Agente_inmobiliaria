"use client";

// Embudo de leads por etapa de cualificación, con tasas sobre el total.
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

const chartConfig: ChartConfig = {
  count: { label: "Leads", color: "var(--chart-1)" },
};

export function FunnelConversionChart({
  counts,
  total,
  rates,
}: {
  counts: Record<string, number>;
  total: number;
  rates: Record<string, number>;
}) {
  const data = Object.entries(statusLabels).map(([status, label]) => ({
    status,
    label,
    count: counts[status] ?? 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embudo de leads</CardTitle>
        <p className="text-sm text-muted-foreground">{total} leads en total</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={100} />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="font-semibold tabular-nums">{Math.round(rates.QUALIFYING * 100)}%</p>
            <p className="text-xs text-muted-foreground">Cualificando</p>
          </div>
          <div>
            <p className="font-semibold tabular-nums">{Math.round(rates.QUALIFIED * 100)}%</p>
            <p className="text-xs text-muted-foreground">Cualificados</p>
          </div>
          <div>
            <p className="font-semibold tabular-nums">{Math.round(rates.DISQUALIFIED * 100)}%</p>
            <p className="text-xs text-muted-foreground">Descartados</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
