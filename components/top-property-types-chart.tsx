"use client";

// Tipos de propiedad más pedidos por los leads.
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig: ChartConfig = {
  count: { label: "Leads", color: "var(--chart-2)" },
};

export function TopPropertyTypesChart({
  data,
}: {
  data: { propertyType: string; count: number }[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Tipos de propiedad más buscados</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="propertyType"
                type="category"
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
