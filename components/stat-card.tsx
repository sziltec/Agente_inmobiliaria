import type { ComponentType } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<{ className?: string; style?: React.CSSProperties }>;

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
  iconColor,
}: {
  label: string;
  value: number | string;
  icon: IconComponent;
  accent?: boolean;
  iconColor?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            accent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-5" style={iconColor ? { color: iconColor } : undefined} />
        </div>
      </CardContent>
    </Card>
  );
}
