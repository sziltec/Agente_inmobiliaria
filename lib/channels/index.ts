// Registro de canales: dado un canal, devuelve cómo enviar mensajes por él.
import type { Channel } from "@prisma/client";
import type { ChannelAdapter } from "./types";
import { whatsappAdapter } from "./whatsapp";
import { messengerAdapter } from "./messenger";
import { instagramAdapter } from "./instagram";

const adapters: Partial<Record<Channel, ChannelAdapter>> = {
  WHATSAPP: whatsappAdapter,
  MESSENGER: messengerAdapter,
  INSTAGRAM: instagramAdapter,
};

export function getAdapter(channel: Channel): ChannelAdapter {
  const adapter = adapters[channel];
  if (!adapter) throw new Error(`No hay adaptador para el canal ${channel}`);
  return adapter;
}
