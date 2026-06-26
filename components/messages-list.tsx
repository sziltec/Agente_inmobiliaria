"use client";

// Lista de conversaciones de la bandeja de Mensajes: buscador + chats
// ordenados por el último mensaje.
//
// Usamos <a> nativo (no next/link): este componente vive en app/messages/layout.tsx,
// que persiste entre navegaciones de /messages a /messages/[id] (igual que el
// layout raíz), y en esta versión de Next.js un <Link> ahí no completa la
// transición del lado del cliente.
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import type { Channel, Direction } from "@prisma/client";
import { timeAgo } from "@/lib/utils";
import { LeadAvatar } from "@/components/lead-avatar";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export type MessageRow = {
  id: string;
  channel: Channel;
  lead: {
    name: string | null;
    avatarUrl: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  lastMessageAt: string;
  lastMessage: { content: string; direction: Direction } | null;
};

export function MessagesList({ conversations }: { conversations: MessageRow[] }) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const name = c.lead?.name?.toLowerCase() ?? "";
      const contact = `${c.lead?.phone ?? ""} ${c.lead?.email ?? ""}`.toLowerCase();
      return name.includes(q) || contact.includes(q);
    });
  }, [conversations, search]);

  return (
    <div className="flex w-80 shrink-0 flex-col border-r">
      <div className="border-b p-3">
        <InputGroup>
          <InputGroupInput
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            No hay conversaciones.
          </p>
        ) : (
          filtered.map((c) => {
            const isActive = pathname === `/messages/${c.id}`;
            return (
              <a
                key={c.id}
                href={`/messages/${c.id}`}
                className={`flex items-center gap-3 border-b px-4 py-3 hover:bg-sidebar-accent ${
                  isActive ? "bg-sidebar-accent" : ""
                }`}
              >
                <LeadAvatar name={c.lead?.name} avatarUrl={c.lead?.avatarUrl} channel={c.channel} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{c.lead?.name || "Sin nombre"}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {timeAgo(c.lastMessageAt)}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {c.lastMessage
                      ? `${c.lastMessage.direction === "OUTBOUND" ? "Tú: " : ""}${c.lastMessage.content}`
                      : "Sin mensajes"}
                  </p>
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}
