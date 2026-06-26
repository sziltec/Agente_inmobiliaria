// Fábrica de handlers de webhook para los canales de Meta (WhatsApp, Messenger,
// Instagram). Los tres comparten el mismo protocolo: GET para la verificación
// inicial (handshake) y POST firmado con HMAC para recibir los mensajes.
import type { NextRequest } from "next/server";
import { verifyMetaSignature } from "@/lib/security";
import { handleInboundMessage } from "@/lib/conversation";
import type { NormalizedMessage } from "./types";

type Parser = (body: unknown) => NormalizedMessage[];

export function createMetaWebhook(parse: Parser, label: string) {
  // Verificación inicial del webhook (handshake con Meta).
  async function GET(req: NextRequest) {
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
  async function POST(req: NextRequest) {
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

    for (const m of parse(body)) {
      try {
        await handleInboundMessage(m);
      } catch (e) {
        // No reventamos: respondemos 200 a Meta igual para que no reintente en
        // bucle. El error queda en los logs para revisarlo.
        console.error(`Error procesando mensaje de ${label}:`, e);
      }
    }

    return new Response("EVENT_RECEIVED", { status: 200 });
  }

  return { GET, POST };
}
