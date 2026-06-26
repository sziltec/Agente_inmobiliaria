// Lectura de prospectos (leads) para la tabla de prospectos.
import { db } from "@/lib/db";

export async function getLeads() {
  return db.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      conversations: {
        orderBy: { lastMessageAt: "desc" },
        take: 1,
        select: { id: true },
      },
    },
  });
}
