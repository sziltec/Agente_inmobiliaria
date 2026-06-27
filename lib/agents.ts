// Lectura de agentes/usuarios del dashboard.
import { db } from "@/lib/db";

export async function getAgents() {
  return db.profile.findMany({ orderBy: { createdAt: "desc" } });
}
