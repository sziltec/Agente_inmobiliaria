import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  createHermesMessagePostHandler,
  createHermesMessageStatusHandler,
  HermesMessageConflictError,
  parseHermesMessagePayload,
} from "../lib/internal/hermes-message";

test("normalizes an inbound Hermes WhatsApp message", () => {
  const result = parseHermesMessagePayload({
    externalId: "+598 99 123 456",
    direction: "inbound",
    content: "  Quiero alquilar en Punta del Este.  ",
    externalMessageId: "wamid.test-1",
    occurredAt: "2026-07-20T00:30:00.000Z",
  });

  assert.equal(result.success, true);
  if (!result.success) return;

  assert.deepEqual(result.data, {
    externalId: "59899123456",
    direction: "INBOUND",
    content: "Quiero alquilar en Punta del Este.",
    externalMessageId: "wamid.test-1",
    occurredAt: new Date("2026-07-20T00:30:00.000Z"),
  });
});

test("rejects malformed or internal Hermes messages", () => {
  assert.equal(
    parseHermesMessagePayload({
      externalId: "not-a-phone",
      direction: "INBOUND",
      content: "Hola",
      externalMessageId: "wamid.test-2",
    }).success,
    false,
  );

  assert.equal(
    parseHermesMessagePayload({
      externalId: "59899123456",
      direction: "tool",
      content: "guardar_lead(...) ",
      externalMessageId: "tool-call-1",
    }).success,
    false,
  );

  assert.equal(
    parseHermesMessagePayload({
      externalId: "59899123456",
      direction: "OUTBOUND",
      content: "   ",
      externalMessageId: "hermes:empty",
    }).success,
    false,
  );
});

test("rejects unauthenticated message writes before persistence", async () => {
  let saveCalls = 0;
  const handler = createHermesMessagePostHandler(async () => {
    saveCalls += 1;
    return {
      message: {
        id: "message-1",
        conversationId: "conversation-1",
        duplicate: false,
      },
      conversation: { botEnabled: true },
    };
  }, "secret-123");

  const response = await handler(
    new Request("http://localhost/api/internal/hermes/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        externalId: "59899123456",
        direction: "INBOUND",
        content: "Hola",
        externalMessageId: "wamid.test-3",
      }),
    }),
  );

  assert.equal(response.status, 401);
  assert.equal(saveCalls, 0);
});

test("validates and persists an authenticated message", async () => {
  let savedContent: string | undefined;
  const handler = createHermesMessagePostHandler(async (message) => {
    savedContent = message.content;
    return {
      message: {
        id: "message-1",
        conversationId: "conversation-1",
        duplicate: false,
      },
      conversation: { botEnabled: false },
    };
  }, "secret-123");

  const response = await handler(
    new Request("http://localhost/api/internal/hermes/messages", {
      method: "POST",
      headers: {
        authorization: "Bearer secret-123",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        externalId: "59899123456",
        direction: "OUTBOUND",
        content: " ¿En qué zona buscás? ",
        externalMessageId: "hermes:session-1:turn-1:outbound",
      }),
    }),
  );

  assert.equal(response.status, 200);
  assert.equal(savedContent, "¿En qué zona buscás?");
  assert.deepEqual(await response.json(), {
    ok: true,
    message: {
      id: "message-1",
      conversationId: "conversation-1",
      duplicate: false,
    },
    conversation: { botEnabled: false },
  });
});

test("returns a conflict instead of accepting a reused external message ID", async () => {
  const handler = createHermesMessagePostHandler(async () => {
    throw new HermesMessageConflictError();
  }, "secret-123");

  const response = await handler(
    new Request("http://localhost/api/internal/hermes/messages", {
      method: "POST",
      headers: {
        authorization: "Bearer secret-123",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        externalId: "59899123456",
        direction: "INBOUND",
        content: "Hola",
        externalMessageId: "wamid.reused",
      }),
    }),
  );

  assert.equal(response.status, 409);
});

test("exposes the authenticated bot status used by the final delivery gate", async () => {
  let receivedExternalId: string | undefined;
  const handler = createHermesMessageStatusHandler(async (externalId) => {
    receivedExternalId = externalId;
    return { botEnabled: false };
  }, "secret-123");

  const response = await handler(
    new Request(
      "http://localhost/api/internal/hermes/messages?externalId=%2B598%2099%20123%20456",
      { headers: { authorization: "Bearer secret-123" } },
    ),
  );

  assert.equal(response.status, 200);
  assert.equal(receivedExternalId, "59899123456");
  assert.deepEqual(await response.json(), {
    ok: true,
    conversation: { botEnabled: false },
  });
});

test("fails closed when the final delivery gate cannot find a conversation", async () => {
  const handler = createHermesMessageStatusHandler(async () => null, "secret-123");
  const response = await handler(
    new Request(
      "http://localhost/api/internal/hermes/messages?externalId=59899123456",
      { headers: { authorization: "Bearer secret-123" } },
    ),
  );

  assert.equal(response.status, 404);
});
