// Webhook de Facebook Messenger (Messenger Platform).
//   GET  → Meta lo usa UNA vez para verificar que la URL es tuya.
//   POST → Meta envía aquí cada mensaje entrante de los usuarios.
import type { NextRequest } from "next/server";
import { parseMessengerWebhook } from "@/lib/channels/messenger";
import { createMetaWebhook } from "@/lib/channels/webhook";

// Necesitamos el runtime de Node (no Edge) porque usamos Prisma y crypto.
export const runtime = "nodejs";

const handler = createMetaWebhook(parseMessengerWebhook, "Messenger");

export function GET(req: NextRequest) {
  return handler.GET(req);
}

export function POST(req: NextRequest) {
  return handler.POST(req);
}
