// Funciones para obtener estadísticas del dashboard.
import { db } from "@/lib/db";
import type { Channel } from "@prisma/client";

// Cantidad de mensajes entrantes por día, últimos 7 días (para el gráfico).
async function getMessagesPerDay(channel?: Channel) {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const messages = await db.message.findMany({
    where: {
      direction: "INBOUND",
      createdAt: { gte: since },
      ...(channel ? { conversation: { channel } } : {}),
    },
    select: { createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const m of messages) {
    const key = m.createdAt.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

// Conteo de chats por canal, usado para las badges del sidebar (consulta
// liviana, se corre en el layout en cada página).
export async function getChannelCounts(): Promise<Record<string, number>> {
  const counts = await db.conversation.groupBy({ by: ["channel"], _count: true });
  return Object.fromEntries(counts.map((c) => [c.channel, c._count]));
}

// `channel` es opcional: si se pasa, filtra todo el dashboard a ese canal
// (lo usa la navegación del sidebar). `search` filtra la bandeja de
// conversaciones por nombre, teléfono o email del lead.
export async function getStats(channel?: Channel, search?: string) {
  const whereChannel = channel ? { channel } : {};

  const whereLeadSearch = search
    ? {
        lead: {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        },
      }
    : {};

  // Todas las consultas son independientes entre sí: se corren en paralelo
  // en vez de una por una, para no acumular la latencia de red hacia la
  // base de datos en cada round-trip.
  const [
    chatsByChannel,
    qualifiedLeads,
    totalChats,
    leadsByStatus,
    recentConversations,
    recentEvents,
    messagesPerDay,
  ] = await Promise.all([
    // Total de chats por canal (sin filtrar, alimenta los contadores del sidebar).
    db.conversation.groupBy({ by: ["channel"], _count: true }),

    // Total de leads cualificados.
    db.lead.count({ where: { status: "QUALIFIED", ...whereChannel } }),

    // Total de chats abiertos (según el filtro de canal).
    db.conversation.count({ where: whereChannel }),

    // Leads por estado.
    db.lead.groupBy({ by: ["status"], _count: true, where: whereChannel }),

    // Últimas conversaciones (últimas 10, o las primeras 50 que coincidan
    // con la búsqueda).
    db.conversation.findMany({
      where: { ...whereChannel, ...whereLeadSearch },
      orderBy: { lastMessageAt: "desc" },
      take: search ? 50 : 10,
      include: {
        lead: {
          select: { id: true, name: true, email: true, phone: true, status: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),

    // Últimos eventos (para el panel de notificaciones/actividad).
    db.event.findMany({
      where: whereChannel,
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        conversation: { include: { lead: { select: { name: true } } } },
      },
    }),

    getMessagesPerDay(channel),
  ]);

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
    recentEvents,
    messagesPerDay,
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
