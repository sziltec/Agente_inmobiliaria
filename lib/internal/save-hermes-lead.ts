import { Channel, LeadStatus, type Operation, type Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import {
  type HermesLeadPayload,
  HermesLeadValidationError,
  mergeAndValidateHermesLeadPayload,
  resolveAdvisorName,
  resolveAdvisorUpdate,
} from "@/lib/internal/hermes-lead";

function definedLeadFields(input: HermesLeadPayload): Prisma.LeadUpdateInput {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.operation !== undefined
      ? { operation: input.operation as Operation }
      : {}),
    ...(input.propertyType !== undefined
      ? { propertyType: input.propertyType }
      : {}),
    ...(input.zone !== undefined ? { zone: input.zone } : {}),
    ...(input.budgetMin !== undefined ? { budgetMin: input.budgetMin } : {}),
    ...(input.budgetMax !== undefined ? { budgetMax: input.budgetMax } : {}),
    ...(input.budgetCurrency !== undefined
      ? { budgetCurrency: input.budgetCurrency }
      : {}),
    ...(input.bedrooms !== undefined ? { bedrooms: input.bedrooms } : {}),
    ...(input.timeline !== undefined ? { timeline: input.timeline } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  };
}

export async function saveHermesLead(input: HermesLeadPayload) {
  const now = new Date();

  return db.$transaction(async (tx) => {
    const where = {
      channel_externalId: {
        channel: Channel.WHATSAPP,
        externalId: input.externalId,
      },
    };
    const existing = await tx.lead.findUnique({
      where,
      select: {
        name: true,
        phone: true,
        status: true,
        operation: true,
        propertyType: true,
        zone: true,
        budgetMin: true,
        budgetMax: true,
        budgetCurrency: true,
        bedrooms: true,
        timeline: true,
        notes: true,
      },
    });
    const mergedResult = mergeAndValidateHermesLeadPayload(input, existing);
    if (!mergedResult.success) throw new HermesLeadValidationError();
    const merged = mergedResult.data;
    const advisorName =
      resolveAdvisorName(merged.operation, merged.zone) ?? null;
    const advisorUpdate = resolveAdvisorUpdate(input, merged);

    const lead = await tx.lead.upsert({
      where,
      create: {
        channel: Channel.WHATSAPP,
        externalId: input.externalId,
        phone: merged.phone ?? input.externalId,
        name: merged.name,
        status: merged.status ?? LeadStatus.QUALIFYING,
        operation: merged.operation as Operation | undefined,
        propertyType: merged.propertyType,
        zone: merged.zone,
        budgetMin: merged.budgetMin,
        budgetMax: merged.budgetMax,
        budgetCurrency: merged.budgetCurrency,
        bedrooms: merged.bedrooms,
        timeline: merged.timeline,
        notes: merged.notes,
        ...(advisorName ? { assignedAdvisorName: advisorName } : {}),
      },
      update: {
        ...definedLeadFields(input),
        ...(advisorUpdate !== undefined
          ? { assignedAdvisorName: advisorUpdate }
          : {}),
      },
    });

    await tx.conversation.upsert({
      where: {
        channel_externalUserId: {
          channel: Channel.WHATSAPP,
          externalUserId: input.externalId,
        },
      },
      create: {
        channel: Channel.WHATSAPP,
        externalUserId: input.externalId,
        leadId: lead.id,
        lastMessageAt: now,
      },
      update: {
        leadId: lead.id,
        lastMessageAt: now,
      },
    });

    return {
      id: lead.id,
      status: lead.status,
      advisorName: lead.assignedAdvisorName,
    };
  });
}
