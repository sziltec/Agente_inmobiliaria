// Canal Facebook Messenger (Messenger Platform de Meta). Reutiliza el parser y
// el envío comunes; solo aporta su token de página propio.
import type { ChannelAdapter, NormalizedMessage } from "./types";
import { parseMessagingWebhook, sendViaGraph, fetchProfileViaGraph } from "./meta-messaging";

export function parseMessengerWebhook(body: unknown): NormalizedMessage[] {
  return parseMessagingWebhook(body, "MESSENGER");
}

export const messengerAdapter: ChannelAdapter = {
  async send(to, text) {
    const token = process.env.PAGE_ACCESS_TOKEN;
    if (!token) {
      throw new Error("Falta PAGE_ACCESS_TOKEN en el .env");
    }
    await sendViaGraph(to, text, token);
  },
  async fetchProfile(externalUserId) {
    const token = process.env.PAGE_ACCESS_TOKEN;
    if (!token) return {};
    return fetchProfileViaGraph(externalUserId, token);
  },
};
