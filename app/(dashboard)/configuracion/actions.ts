"use server";

// Acciones del panel de Configuración (solo ADMIN): activar/desactivar canales
// y elegir quién maneja las conversaciones (Gemini o Hermes). Se guarda en la
// fila única de la tabla Settings.
import { revalidatePath } from "next/cache";
import type { Channel, ConversationRuntime } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";

const SETTINGS_ID = "global";

// Campo de activación de cada canal en la tabla Settings.
const channelField: Record<Channel, "whatsappEnabled" | "messengerEnabled" | "instagramEnabled"> = {
  WHATSAPP: "whatsappEnabled",
  MESSENGER: "messengerEnabled",
  INSTAGRAM: "instagramEnabled",
};

export async function setChannelEnabled(channel: Channel, enabled: boolean) {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "ADMIN") throw new Error("No autorizado.");

  const field = channelField[channel];
  if (!field) throw new Error("Canal inválido.");

  await db.settings.upsert({
    where: { id: SETTINGS_ID },
    update: { [field]: enabled },
    create: { id: SETTINGS_ID, [field]: enabled },
  });

  revalidatePath("/configuracion");
}

export async function setRuntime(runtime: ConversationRuntime) {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "ADMIN") throw new Error("No autorizado.");

  if (runtime !== "GEMINI" && runtime !== "HERMES") {
    throw new Error("Runtime inválido.");
  }

  await db.settings.upsert({
    where: { id: SETTINGS_ID },
    update: { runtime },
    create: { id: SETTINGS_ID, runtime },
  });

  revalidatePath("/configuracion");
}
