// Registro de canales: dado un canal, devuelve cómo enviar mensajes por él.
// Messenger e Instagram se añadirán aquí en la Fase 4.
import type { Channel } from "@prisma/client";
import type { ChannelAdapter } from "./types";
import { whatsappAdapter } from "./whatsapp";

const adapters: Partial<Record<Channel, ChannelAdapter>> = {
  WHATSAPP: whatsappAdapter,
};

export function getAdapter(channel: Channel): ChannelAdapter {
  const adapter = adapters[channel];
  if (!adapter) throw new Error(`No hay adaptador para el canal ${channel}`);
  return adapter;
}
