// Lectura de propiedades publicadas para el dashboard.
import { db } from "@/lib/db";

export async function getProperties() {
  return db.property.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getProperty(id: string) {
  return db.property.findUnique({ where: { id } });
}
