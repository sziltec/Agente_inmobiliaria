// Webhook de WhatsApp Cloud API.
//   GET  → Meta lo usa UNA vez para verificar que la URL es tuya.
//   POST → Meta envía aquí cada mensaje entrante de los clientes.
import type { NextRequest } from "next/server";
import { verifyMetaSignature } from "@/lib/security";
import { parseWhatsAppWebhook } from "@/lib/channels/whatsapp";
import { handleInboundMessage } from "@/lib/conversation";

// Necesitamos el runtime de Node (no Edge) porque usamos Prisma y crypto.
export const runtime = "nodejs";

// Verificación inicial del webhook (handshake con Meta).
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// Recepción de mensajes.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Seguridad: comprobar la firma de Meta antes de procesar nada.
  if (!verifyMetaSignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const messages = parseWhatsAppWebhook(body);
  for (const m of messages) {
    try {
      await handleInboundMessage(m);
    } catch (e) {
      // No reventamos: respondemos 200 a Meta igual para que no reintente en
      // bucle. El error queda en los logs para revisarlo.
      console.error("Error procesando mensaje de WhatsApp:", e);
    }
  }

  return new Response("EVENT_RECEIVED", { status: 200 });
}
