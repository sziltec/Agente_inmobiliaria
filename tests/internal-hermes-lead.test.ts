import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  createHermesLeadPostHandler,
  mergeAndValidateHermesLeadPayload,
  parseHermesLeadPayload,
  resolveAdvisorName,
  resolveAdvisorUpdate,
  verifyInternalBearerToken,
} from "../lib/internal/hermes-lead";

test("normalizes a valid qualified WhatsApp lead", () => {
  const result = parseHermesLeadPayload({
    externalId: "59899123456",
    name: "Lucía Pérez",
    phone: "+598 99 123 456",
    status: "qualified",
    operation: "rent",
    propertyType: "casa",
    zone: "La Barra",
    budgetMax: 2000,
    budgetCurrency: "usd",
    bedrooms: 2,
    timeline: "próximo mes",
    notes: "Busca alquiler anual.",
  });

  assert.equal(result.success, true);
  if (!result.success) return;

  assert.deepEqual(result.data, {
    externalId: "59899123456",
    name: "Lucía Pérez",
    phone: "+598 99 123 456",
    status: "QUALIFIED",
    operation: "RENT",
    propertyType: "casa",
    zone: "La Barra",
    budgetMin: undefined,
    budgetMax: 2000,
    budgetCurrency: "USD",
    bedrooms: 2,
    timeline: "próximo mes",
    notes: "Busca alquiler anual.",
  });
});

test("routes La Barra leads to Juan before operation-specific rules", () => {
  assert.equal(resolveAdvisorName("RENT", "La Barra"), "Juan López");
  assert.equal(resolveAdvisorName("SELL", "La Barra"), "Juan López");
});

test("validates persisted budgets and clears stale advisor suggestions", () => {
  const partialBudget = parseHermesLeadPayload({
    externalId: "59899123456",
    budgetMin: 3000,
  });
  assert.equal(partialBudget.success, true);
  if (!partialBudget.success) return;

  const invalidMergedBudget = mergeAndValidateHermesLeadPayload(
    partialBudget.data,
    { status: "QUALIFYING", budgetMax: 2000 },
  );
  assert.equal(invalidMergedBudget.success, false);

  const zoneChange = parseHermesLeadPayload({
    externalId: "59899123456",
    zone: "Pocitos",
  });
  assert.equal(zoneChange.success, true);
  if (!zoneChange.success) return;

  const mergedZone = mergeAndValidateHermesLeadPayload(zoneChange.data, {
    status: "QUALIFYING",
    zone: "La Barra",
  });
  assert.equal(mergedZone.success, true);
  if (!mergedZone.success) return;
  assert.equal(resolveAdvisorUpdate(zoneChange.data, mergedZone.data), null);
});

test("authenticates the internal API with an exact bearer token", () => {
  assert.equal(verifyInternalBearerToken("Bearer secret-123", "secret-123"), true);
  assert.equal(verifyInternalBearerToken("Bearer wrong", "secret-123"), false);
  assert.equal(verifyInternalBearerToken(null, "secret-123"), false);
  assert.equal(verifyInternalBearerToken("Bearer secret-123", undefined), false);
});

test("rejects unauthenticated CRM writes before calling the database", async () => {
  let saveCalls = 0;
  const handler = createHermesLeadPostHandler(async () => {
    saveCalls += 1;
    return { id: "lead-1", status: "QUALIFYING", advisorName: null };
  }, "secret-123");

  const response = await handler(
    new Request("http://localhost/api/internal/hermes/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ externalId: "59899123456" }),
    }),
  );

  assert.equal(response.status, 401);
  assert.equal(saveCalls, 0);
});

test("validates and persists an authenticated CRM write", async () => {
  let savedExternalId: string | undefined;
  const handler = createHermesLeadPostHandler(async (lead) => {
    savedExternalId = lead.externalId;
    return { id: "lead-1", status: lead.status, advisorName: "Tamara Ríos" };
  }, "secret-123");

  const response = await handler(
    new Request("http://localhost/api/internal/hermes/leads", {
      method: "POST",
      headers: {
        authorization: "Bearer secret-123",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        externalId: "59899123456",
        status: "QUALIFYING",
        operation: "rent",
        zone: "Punta del Este",
      }),
    }),
  );

  assert.equal(response.status, 200);
  assert.equal(savedExternalId, "59899123456");
  assert.deepEqual(await response.json(), {
    ok: true,
    lead: { id: "lead-1", status: "QUALIFYING", advisorName: "Tamara Ríos" },
  });
});

test("rejects malformed lead data", async () => {
  const handler = createHermesLeadPostHandler(async () => {
    throw new Error("must not be called");
  }, "secret-123");

  const response = await handler(
    new Request("http://localhost/api/internal/hermes/leads", {
      method: "POST",
      headers: {
        authorization: "Bearer secret-123",
        "content-type": "application/json",
      },
      body: JSON.stringify({ externalId: "not-a-phone" }),
    }),
  );

  assert.equal(response.status, 400);

  const invalidCurrency = parseHermesLeadPayload({
    externalId: "59899123456",
    status: "QUALIFYING",
    budgetCurrency: "12$",
  });
  assert.equal(invalidCurrency.success, false);

  const incompleteQualifiedLead = parseHermesLeadPayload({
    externalId: "59899123456",
    status: "QUALIFIED",
    operation: "RENT",
  });
  assert.equal(incompleteQualifiedLead.success, false);

  const invertedBudget = parseHermesLeadPayload({
    externalId: "59899123456",
    status: "QUALIFYING",
    budgetMin: 3000,
    budgetMax: 2000,
  });
  assert.equal(invertedBudget.success, false);
});
