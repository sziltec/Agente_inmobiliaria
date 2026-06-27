"use client";

// Menú de opciones del encabezado de una conversación (Mensajes).
import { MoreVertical, Trash2 } from "lucide-react";
import { deleteConversation } from "@/app/(dashboard)/messages/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ConversationMenu({ conversationId }: { conversationId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <span className="sr-only">Opciones de la conversación</span>
        <MoreVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            if (window.confirm("¿Eliminar esta conversación? No se puede deshacer.")) {
              deleteConversation(conversationId);
            }
          }}
        >
          <Trash2 />
          Eliminar chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
