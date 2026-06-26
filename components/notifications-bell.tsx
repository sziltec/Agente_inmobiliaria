"use client";

// Campana de notificaciones: muestra los últimos eventos (mensajes, leads
// cualificados, chats nuevos) en un menú desplegable.
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NotificationItem = {
  id: string;
  type: string;
  channel: string;
  leadName: string | null;
  createdAt: string;
};

const typeLabels: Record<string, string> = {
  chat_opened: "Nueva conversación",
  message_received: "Nuevo mensaje",
  lead_qualified: "Lead cualificado",
};

const channelLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  MESSENGER: "Messenger",
  INSTAGRAM: "Instagram",
};

export function NotificationsBell({ items }: { items: NotificationItem[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Bell className="size-5" />
        {items.length > 0 && (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            Sin actividad todavía.
          </div>
        ) : (
          items.map((item) => (
            <DropdownMenuItem key={item.id} className="flex-col items-start gap-0.5">
              <span className="text-sm">
                {typeLabels[item.type] ?? item.type}
                {item.leadName ? ` — ${item.leadName}` : ""}
              </span>
              <span className="text-xs text-muted-foreground">
                {channelLabels[item.channel] ?? item.channel} · {timeAgo(item.createdAt)}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
