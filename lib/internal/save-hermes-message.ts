import { Channel } from "@prisma/client";

import { db } from "@/lib/db";
import {
  HermesMessageConflictError,
  type HermesMessagePayload,
} from "@/lib/internal/hermes-message";

export async function saveHermesMessage(input: HermesMessagePayload) {
  return db.$transaction(async (tx) => {
    const lead = await tx.lead.upsert({
      where: {
        channel_externalId: {
          channel: Channel.WHATSAPP,
          externalId: input.externalId,
        },
      },
      update: {},
      create: {
        channel: Channel.WHATSAPP,
        externalId: input.externalId,
        phone: `+${input.externalId}`,
        status: "NEW",
      },
    });

    const conversation = await tx.conversation.upsert({
      where: {
        channel_externalUserId: {
          channel: Channel.WHATSAPP,
          externalUserId: input.externalId,
        },
      },
      update: { leadId: lead.id },
      create: {
        channel: Channel.WHATSAPP,
        externalUserId: input.externalId,
        leadId: lead.id,
        lastMessageAt: input.occurredAt,
      },
    });

    const inserted = await tx.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          direction: input.direction,
          content: input.content,
          providerMessageId: input.externalMessageId,
          createdAt: input.occurredAt,
        },
      ],
      skipDuplicates: true,
    });

    const message = await tx.message.findUniqueOrThrow({
      where: { providerMessageId: input.externalMessageId },
      select: {
        id: true,
        conversationId: true,
        direction: true,
        content: true,
      },
    });

    if (
      message.conversationId !== conversation.id ||
      message.direction !== input.direction ||
      message.content !== input.content
    ) {
      throw new HermesMessageConflictError();
    }

    if (inserted.count === 1) {
      const lastMessageAt =
        input.occurredAt > conversation.lastMessageAt
          ? input.occurredAt
          : conversation.lastMessageAt;

      await tx.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt },
      });

      await tx.event.create({
        data: {
          type:
            input.direction === "INBOUND"
              ? "message_received"
              : "message_sent",
          channel: Channel.WHATSAPP,
          conversationId: conversation.id,
        },
      });
    }

    return {
      message: {
        id: message.id,
        conversationId: message.conversationId,
        duplicate: inserted.count === 0,
      },
      conversation: {
        botEnabled: conversation.botEnabled,
      },
    };
  });
}

export async function getHermesConversationStatus(externalId: string) {
  return db.conversation.findUnique({
    where: {
      channel_externalUserId: {
        channel: Channel.WHATSAPP,
        externalUserId: externalId,
      },
    },
    select: { botEnabled: true },
  });
}
