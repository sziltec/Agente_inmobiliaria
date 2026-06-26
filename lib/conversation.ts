// Orquestador central: recibe un mensaje normalizado (de cualquier red),
// lo guarda, reconstruye el historial, llama al agente IA, guarda la respuesta
// y los datos del lead, registra eventos para estadísticas y responde por el
// canal correspondiente. Es el mismo flujo para WhatsApp, Messenger e Instagram.
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { runAgentTurn, type ChatMessage } from "@/lib/agent/agent";
import type { LeadData } from "@/lib/agent/types";
import { getAdapter } from "@/lib/channels";
import type { NormalizedMessage } from "@/lib/channels/types";

export async function handleInboundMessage(msg: NormalizedMessage): Promise<void> {
  // --- 1. Lead (cliente potencial): crear o actualizar ---
  const lead = await db.lead.upsert({
    where: {
      channel_externalId: { channel: msg.channel, externalId: msg.externalUserId },
    },
    update: msg.name ? { name: msg.name } : {},
    create: {
      channel: msg.channel,
      externalId: msg.externalUserId,
      name: msg.name,
      status: "NEW",
    },
  });

  // --- 1.5 Foto de perfil: si todavía no la tenemos, la pedimos una sola
  // vez (Messenger/Instagram la dan vía Graph API; WhatsApp no la expone).
  if (!lead.avatarUrl) {
    const profile = await getAdapter(msg.channel).fetchProfile?.(msg.externalUserId);
    if (profile?.name || profile?.avatarUrl) {
      await db.lead.update({
        where: { id: lead.id },
        data: {
          name: lead.name ?? profile.name,
          avatarUrl: profile.avatarUrl,
        },
      });
      if (!lead.name && profile.name) lead.name = profile.name;
    }
  }

  // --- 2. Conversación: crear o recuperar (y detectar si es nueva) ---
  const existing = await db.conversation.findUnique({
    where: {
      channel_externalUserId: {
        channel: msg.channel,
        externalUserId: msg.externalUserId,
      },
    },
  });
  const conversation =
    existing ??
    (await db.conversation.create({
      data: {
        channel: msg.channel,
        externalUserId: msg.externalUserId,
        leadId: lead.id,
      },
    }));

  // Evento para estadísticas: chat nuevo abierto en esta red.
  if (!existing) {
    await db.event.create({
      data: { type: "chat_opened", channel: msg.channel, conversationId: conversation.id },
    });
  }

  // --- 3. Anti-duplicados: si ya procesamos este mensaje, salimos ---
  if (msg.messageId) {
    const dup = await db.message.findUnique({
      where: { providerMessageId: msg.messageId },
    });
    if (dup) return;
  }

  // --- 4. Guardar el mensaje entrante ---
  await db.message.create({
    data: {
      conversationId: conversation.id,
      direction: "INBOUND",
      content: msg.text,
      providerMessageId: msg.messageId,
      raw: msg.raw as Prisma.InputJsonValue,
    },
  });
  await db.event.create({
    data: { type: "message_received", channel: msg.channel, conversationId: conversation.id },
  });

  // Si un humano apagó el bot para esta conversación, guardamos el mensaje
  // entrante pero no generamos ni enviamos una respuesta automática.
  if (!conversation.botEnabled) return;

  // --- 5. Reconstruir el historial de la conversación para el agente ---
  const rows = await db.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
  });
  const history: ChatMessage[] = rows.map((r) =>
    r.direction === "INBOUND"
      ? { role: "user", content: r.content }
      : { role: "assistant", content: r.content },
  );

  const currentLead: LeadData = {
    name: lead.name ?? undefined,
    phone: lead.phone ?? undefined,
    email: lead.email ?? undefined,
    operation: lead.operation ?? undefined,
    propertyType: lead.propertyType ?? undefined,
    zone: lead.zone ?? undefined,
    budgetMin: lead.budgetMin ?? undefined,
    budgetMax: lead.budgetMax ?? undefined,
    bedrooms: lead.bedrooms ?? undefined,
    timeline: lead.timeline ?? undefined,
    notes: lead.notes ?? undefined,
    status: lead.status,
  };

  // --- 6. El agente IA genera la respuesta y actualiza los datos del lead ---
  const result = await runAgentTurn({ messages: history, lead: currentLead });
  const reply = result.reply || "Disculpa, ¿podrías repetirlo?";

  // --- 7. Guardar la respuesta del agente ---
  await db.message.create({
    data: { conversationId: conversation.id, direction: "OUTBOUND", content: reply },
  });

  // --- 8. Actualizar los datos del lead ---
  const updated = result.lead;
  await db.lead.update({
    where: { id: lead.id },
    data: {
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      operation: updated.operation,
      propertyType: updated.propertyType,
      zone: updated.zone,
      budgetMin: updated.budgetMin,
      budgetMax: updated.budgetMax,
      bedrooms: updated.bedrooms,
      timeline: updated.timeline,
      notes: updated.notes,
      status: updated.status ?? lead.status,
    },
  });

  // Evento para estadísticas: el lead pasó a CUALIFICADO.
  if (updated.status === "QUALIFIED" && lead.status !== "QUALIFIED") {
    await db.event.create({
      data: { type: "lead_qualified", channel: msg.channel, conversationId: conversation.id },
    });
  }

  await db.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() },
  });

  // --- 9. Responder por el canal de origen ---
  await getAdapter(msg.channel).send(msg.externalUserId, reply);
}
