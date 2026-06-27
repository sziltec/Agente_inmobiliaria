"use server";

// Acciones sobre un lead: asignar agente (solo ADMIN) y registrar el
// resultado comercial (ganado/perdido).
import { revalidatePath } from "next/cache";
import type { Channel, DealStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser, verifySession } from "@/lib/dal";

export async function assignLead(
  leadId: string,
  agentId: string | null,
  channel: Channel,
) {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "ADMIN") return;

  await db.lead.update({ where: { id: leadId }, data: { agentId } });
  await db.event.create({
    data: { type: "lead_assigned", channel, metadata: { agentId } },
  });

  revalidatePath("/leads");
}

export async function setDealOutcome(
  leadId: string,
  dealStatus: DealStatus,
  dealAmount: number | null,
  channel: Channel,
) {
  await verifySession();

  await db.lead.update({ where: { id: leadId }, data: { dealStatus, dealAmount } });

  const eventType =
    dealStatus === "WON" ? "deal_won" : dealStatus === "LOST" ? "deal_lost" : "deal_reopened";
  await db.event.create({
    data: { type: eventType, channel, metadata: { leadId, dealAmount } },
  });

  revalidatePath("/leads");
}
