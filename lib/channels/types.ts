// Tipos comunes a todos los canales (WhatsApp, Messenger, Instagram).
import type { Channel } from "@prisma/client";

// Un mensaje entrante ya "normalizado": no importa de qué red venga, todos
// los canales lo convierten a esta misma forma para que el resto del sistema
// no tenga que saber de WhatsApp, Instagram, etc.
export type NormalizedMessage = {
  channel: Channel;
  // Id del usuario en la plataforma (teléfono de WhatsApp, id de IG/Messenger).
  externalUserId: string;
  name?: string;
  text: string;
  // Carga original del webhook (para guardar/depurar).
  raw: unknown;
  // Id del mensaje en la plataforma (para evitar duplicados).
  messageId?: string;
};

// Cada canal sabe cómo ENVIAR un mensaje de texto a un usuario.
export type ChannelAdapter = {
  send(to: string, text: string): Promise<void>;
};
