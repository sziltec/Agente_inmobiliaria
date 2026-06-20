// Canal WhatsApp (Meta Cloud API): traduce los webhooks entrantes a nuestro
// formato normalizado y sabe enviar respuestas por la Graph API.
import type { ChannelAdapter, NormalizedMessage } from "./types";

const GRAPH_API = "https://graph.facebook.com/v21.0";

// Forma (parcial) del webhook que envía WhatsApp Cloud API.
type WhatsAppWebhook = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
        messages?: Array<{
          from: string;
          id: string;
          type: string;
          text?: { body?: string };
        }>;
      };
    }>;
  }>;
};

// Convierte el cuerpo del webhook en una lista de mensajes normalizados.
// Por ahora solo procesamos mensajes de TEXTO (ignoramos audios, imágenes...).
export function parseWhatsAppWebhook(body: unknown): NormalizedMessage[] {
  const webhook = body as WhatsAppWebhook;
  const result: NormalizedMessage[] = [];

  for (const entry of webhook.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      // Mapa wa_id -> nombre del perfil.
      const names: Record<string, string> = {};
      for (const c of value.contacts ?? []) {
        if (c.wa_id && c.profile?.name) names[c.wa_id] = c.profile.name;
      }
      for (const m of value.messages ?? []) {
        const text = m.text?.body;
        if (m.type !== "text" || !text) continue;
        result.push({
          channel: "WHATSAPP",
          externalUserId: m.from,
          name: names[m.from],
          text,
          raw: m,
          messageId: m.id,
        });
      }
    }
  }
  return result;
}

export const whatsappAdapter: ChannelAdapter = {
  async send(to, text) {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneId) {
      throw new Error(
        "Faltan WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID en el .env",
      );
    }
    const res = await fetch(`${GRAPH_API}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });
    if (!res.ok) {
      throw new Error(`Error enviando WhatsApp (${res.status}): ${await res.text()}`);
    }
  },
};
