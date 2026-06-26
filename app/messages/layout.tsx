// Bandeja de Mensajes: lista de conversaciones (todos los canales) a la
// izquierda y la conversación seleccionada a la derecha (children).
import { getConversationsList } from "@/lib/messages";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { MessagesList, type MessageRow } from "@/components/messages-list";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getConversationsList();

  const rows: MessageRow[] = conversations.map((conv) => ({
    id: conv.id,
    channel: conv.channel,
    lead: conv.lead
      ? {
          name: conv.lead.name,
          avatarUrl: conv.lead.avatarUrl,
          phone: conv.lead.phone,
          email: conv.lead.email,
        }
      : null,
    lastMessageAt: conv.lastMessageAt.toISOString(),
    lastMessage: conv.messages[0]
      ? { content: conv.messages[0].content, direction: conv.messages[0].direction }
      : null,
  }));

  return (
    // h-svh: el header y la fila de abajo necesitan una altura total fija
    // (no solo "mínima") para que la lista y la conversación puedan scrollear
    // internamente en vez de estirar toda la página.
    <div className="flex h-svh flex-col">
      <DashboardTopbar breadcrumb="Mensajes" notifications={[]} />
      <div className="flex flex-1 overflow-hidden">
        <MessagesList conversations={rows} />
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
