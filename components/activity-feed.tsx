// Panel lateral con la actividad reciente (mensajes, leads cualificados, chats nuevos).
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, MessageCircle, Sparkles, UserCheck, UserPlus, XCircle } from "lucide-react";
import type { NotificationItem } from "@/components/notifications-bell";
import { timeAgo } from "@/lib/utils";

const typeMeta: Record<string, { label: string; icon: typeof MessageCircle }> = {
  chat_opened: { label: "Nueva conversación", icon: UserPlus },
  message_received: { label: "Nuevo mensaje", icon: MessageCircle },
  lead_qualified: { label: "Lead cualificado", icon: Sparkles },
  lead_assigned: { label: "Lead asignado", icon: UserCheck },
  deal_won: { label: "Cierre ganado", icon: CircleDollarSign },
  deal_lost: { label: "Cierre perdido", icon: XCircle },
  deal_reopened: { label: "Cierre reabierto", icon: Sparkles },
};

const channelLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  MESSENGER: "Messenger",
  INSTAGRAM: "Instagram",
};

export function ActivityFeed({ items }: { items: NotificationItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin actividad todavía.</p>
        ) : (
          items.map((item) => {
            const meta = typeMeta[item.type] ?? { label: item.type, icon: MessageCircle };
            const Icon = meta.icon;
            return (
              <div key={item.id} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm leading-tight">
                    {meta.label}
                    {item.leadName ? ` — ${item.leadName}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {channelLabels[item.channel] ?? item.channel} · {timeAgo(item.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
