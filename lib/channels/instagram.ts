// Canal Instagram (mensajería directa vía Messenger Platform de Meta).
// Reutiliza el parser y el envío comunes; solo aporta su token propio.
import type { ChannelAdapter, NormalizedMessage } from "./types";
import { parseMessagingWebhook, sendViaGraph, fetchProfileViaGraph } from "./meta-messaging";

export function parseInstagramWebhook(body: unknown): NormalizedMessage[] {
  return parseMessagingWebhook(body, "INSTAGRAM");
}

export const instagramAdapter: ChannelAdapter = {
  async send(to, text) {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!token) {
      throw new Error("Falta INSTAGRAM_ACCESS_TOKEN en el .env");
    }
    await sendViaGraph(to, text, token);
  },
  async fetchProfile(externalUserId) {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!token) return {};
    return fetchProfileViaGraph(externalUserId, token);
  },
};
