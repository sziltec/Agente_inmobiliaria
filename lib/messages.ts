// Lecturas para la bandeja de Mensajes: lista de conversaciones (todos los
// canales) y el detalle de una conversación puntual.
import { db } from "@/lib/db";

export async function getConversationsList() {
  return db.conversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: {
      lead: {
        select: { name: true, avatarUrl: true, phone: true, email: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function getConversation(conversationId: string) {
  return db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      lead: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
