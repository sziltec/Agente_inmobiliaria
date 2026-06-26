// Lógica común a Messenger e Instagram: ambos usan la "Messenger Platform" de
// Meta, con el MISMO formato de webhook (entry[].messaging[]) y la MISMA Send
// API. Lo único que cambia entre los dos es el token y la etiqueta de canal.
import type { Channel } from "@prisma/client";
import type { NormalizedMessage } from "./types";

const GRAPH_API = "https://graph.facebook.com/v21.0";

// Forma (parcial) del webhook de la Messenger Platform (Messenger e Instagram).
type MessagingWebhook = {
  entry?: Array<{
    messaging?: Array<{
      sender?: { id?: string };
      message?: {
        mid?: string;
        text?: string;
        // "echo" = copia del mensaje que mandó el propio bot; hay que ignorarlo
        // o entraría en un bucle respondiéndose a sí mismo.
        is_echo?: boolean;
      };
    }>;
  }>;
};

// Convierte el cuerpo del webhook en mensajes normalizados. Solo procesa texto
// (ignora adjuntos) e ignora los "echo".
export function parseMessagingWebhook(
  body: unknown,
  channel: Channel,
): NormalizedMessage[] {
  const webhook = body as MessagingWebhook;
  const result: NormalizedMessage[] = [];

  for (const entry of webhook.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      const msg = event.message;
      const senderId = event.sender?.id;
      if (!msg || msg.is_echo || !msg.text || !senderId) continue;
      result.push({
        channel,
        externalUserId: senderId,
        // La Messenger Platform no manda el nombre en el evento; quedaría que
        // pedirlo aparte con la Graph API si se quisiera mostrar.
        text: msg.text,
        raw: event,
        messageId: msg.mid,
      });
    }
  }
  return result;
}

// Pide nombre y foto de perfil de un usuario (PSID/IGSID) a la User Profile
// API de Meta. Sirve para Messenger e Instagram: solo cambia el token.
// Si falla (sin permiso, perfil no disponible, etc.) no rompemos el flujo:
// simplemente devolvemos vacío y el lead se queda sin foto.
export async function fetchProfileViaGraph(
  userId: string,
  token: string,
): Promise<{ name?: string; avatarUrl?: string }> {
  try {
    const res = await fetch(
      `${GRAPH_API}/${userId}?fields=name,profile_pic&access_token=${token}`,
    );
    if (!res.ok) return {};
    const data = (await res.json()) as { name?: string; profile_pic?: string };
    return { name: data.name, avatarUrl: data.profile_pic };
  } catch (e) {
    console.error(`No se pudo obtener el perfil de ${userId}:`, e);
    return {};
  }
}

// Envía un mensaje de texto por la Send API de Meta. Sirve para Messenger e
// Instagram: solo cambia el token de la página/cuenta.
export async function sendViaGraph(
  to: string,
  text: string,
  token: string,
): Promise<void> {
  const res = await fetch(`${GRAPH_API}/me/messages?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: to },
      messaging_type: "RESPONSE",
      message: { text },
    }),
  });
  if (!res.ok) {
    throw new Error(`Error enviando mensaje (${res.status}): ${await res.text()}`);
  }
}
