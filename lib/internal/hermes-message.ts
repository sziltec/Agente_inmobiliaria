import { z } from "zod";

import { verifyInternalBearerToken } from "./hermes-lead";

const externalIdSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.replace(/\D/g, "") : value),
  z.string().min(8).max(20).regex(/^\d+$/),
);

const hermesMessageSchema = z.object({
  externalId: externalIdSchema,
  direction: z.preprocess(
    (value) => (typeof value === "string" ? value.toUpperCase() : value),
    z.enum(["INBOUND", "OUTBOUND"]),
  ),
  content: z.string().trim().min(1).max(10_000),
  externalMessageId: z.string().trim().min(1).max(512),
  occurredAt: z
    .string()
    .datetime({ offset: true })
    .transform((value) => new Date(value))
    .optional()
    .default(() => new Date()),
});

export type HermesMessagePayload = z.infer<typeof hermesMessageSchema>;

export function parseHermesMessagePayload(input: unknown) {
  return hermesMessageSchema.safeParse(input);
}

export class HermesMessageConflictError extends Error {
  constructor() {
    super("External message ID is already associated with another message");
    this.name = "HermesMessageConflictError";
  }
}

type SavedHermesMessage = {
  message: {
    id: string;
    conversationId: string;
    duplicate: boolean;
  };
  conversation: {
    botEnabled: boolean;
  };
};

type SaveHermesMessage = (
  input: HermesMessagePayload,
) => Promise<SavedHermesMessage>;

type GetHermesConversationStatus = (
  externalId: string,
) => Promise<{ botEnabled: boolean } | null>;

export function createHermesMessagePostHandler(
  saveMessage: SaveHermesMessage,
  expectedToken: string | undefined,
) {
  return async function postHermesMessage(request: Request) {
    if (!verifyInternalBearerToken(request.headers.get("authorization"), expectedToken)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = parseHermesMessagePayload(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid message payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    try {
      const saved = await saveMessage(parsed.data);
      return Response.json({ ok: true, ...saved });
    } catch (error) {
      if (error instanceof HermesMessageConflictError) {
        return Response.json(
          { error: "External message ID conflict" },
          { status: 409 },
        );
      }
      console.error("[hermes-messages] Failed to save message", error);
      return Response.json({ error: "Unable to save message" }, { status: 500 });
    }
  };
}

export function createHermesMessageStatusHandler(
  getStatus: GetHermesConversationStatus,
  expectedToken: string | undefined,
) {
  return async function getHermesMessageStatus(request: Request) {
    if (!verifyInternalBearerToken(request.headers.get("authorization"), expectedToken)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = externalIdSchema.safeParse(
      new URL(request.url).searchParams.get("externalId"),
    );
    if (!parsed.success) {
      return Response.json({ error: "Invalid external ID" }, { status: 400 });
    }

    const conversation = await getStatus(parsed.data);
    if (!conversation) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    return Response.json({ ok: true, conversation });
  };
}
