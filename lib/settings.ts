// Configuración global de la app (fila única en la tabla Settings). Controla
// qué canales están activos y quién maneja las conversaciones (Gemini/Hermes).
// La usan tanto el panel de Configuración como el webhook al recibir mensajes.
import type { Channel, Settings } from "@prisma/client";
import { db } from "@/lib/db";

// Id fijo de la fila única de configuración.
const SETTINGS_ID = "global";

// Lee la configuración; si todavía no existe la fila, la crea con los valores
// por defecto (todos los canales activos, runtime Gemini).
export async function getSettings(): Promise<Settings> {
  return db.settings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}

// Mapea cada canal con su campo de activación en la configuración.
const channelField: Record<Channel, keyof Settings> = {
  WHATSAPP: "whatsappEnabled",
  MESSENGER: "messengerEnabled",
  INSTAGRAM: "instagramEnabled",
};

// ¿Está activo el canal según la configuración?
export function isChannelEnabled(settings: Settings, channel: Channel): boolean {
  return settings[channelField[channel]] === true;
}
