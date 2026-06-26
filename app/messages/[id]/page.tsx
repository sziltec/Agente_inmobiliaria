// Detalle de una conversación dentro de la bandeja de Mensajes.
import { notFound } from "next/navigation";
import { getConversation } from "@/lib/messages";
import { LeadAvatar } from "@/components/lead-avatar";
import { ConversationMenu } from "@/components/conversation-menu";
import { MessageComposer } from "@/components/message-composer";

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conv = await getConversation(id);

  if (!conv) {
    notFound();
  }

  return (
    <>
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <LeadAvatar name={conv.lead?.name} avatarUrl={conv.lead?.avatarUrl} channel={conv.channel} />
          <div>
            <div className="font-medium">{conv.lead?.name || "Sin nombre"}</div>
            <div className="text-xs text-muted-foreground">
              {conv.lead?.email || conv.lead?.phone || "Sin contacto"}
            </div>
          </div>
        </div>
        <ConversationMenu conversationId={id} />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-2xl space-y-4">
          {conv.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.direction === "INBOUND" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  msg.direction === "INBOUND"
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`mt-1 text-xs ${
                    msg.direction === "INBOUND"
                      ? "text-muted-foreground"
                      : "text-primary-foreground/70"
                  }`}
                >
                  {msg.createdAt.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {conv.messages.length === 0 && (
            <p className="mt-8 text-center text-muted-foreground">
              No hay mensajes en esta conversación.
            </p>
          )}
        </div>
      </div>

      <MessageComposer conversationId={id} />
    </>
  );
}
