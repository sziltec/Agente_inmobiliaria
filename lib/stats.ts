// Funciones para obtener estadísticas del dashboard.
import { db } from "@/lib/db";

export async function getStats() {
  // Total de chats abiertos por canal.
  const chatsByChannel = await db.conversation.groupBy({
    by: ["channel"],
    _count: true,
  });

  // Total de leads cualificados.
  const qualifiedLeads = await db.lead.count({
    where: { status: "QUALIFIED" },
  });

  // Total de chats abiertos (todos los canales).
  const totalChats = await db.conversation.count();

  // Leads por estado.
  const leadsByStatus = await db.lead.groupBy({
    by: ["status"],
    _count: true,
  });

  // Últimas conversaciones (últimas 10).
  const recentConversations = await db.conversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 10,
    include: {
      lead: {
        select: { id: true, name: true, email: true, phone: true, status: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return {
    chatsByChannel: Object.fromEntries(
      chatsByChannel.map((c) => [c.channel, c._count]),
    ),
    totalChats,
    qualifiedLeads,
    leadsByStatus: Object.fromEntries(
      leadsByStatus.map((s) => [s.status, s._count]),
    ),
    recentConversations,
  };
}

// Obtener detalle de una conversación (todos sus mensajes).
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
