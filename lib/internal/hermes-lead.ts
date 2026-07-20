import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

const upperEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim().toUpperCase() : value),
    z.enum(values),
  );

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );

const payloadSchema = z
  .object({
    externalId: z.string().trim().min(6).max(32).regex(/^\d+$/),
    name: optionalText(120),
    phone: optionalText(32),
    status: upperEnum([
      "NEW",
      "QUALIFYING",
      "QUALIFIED",
      "DISQUALIFIED",
    ] as const).optional(),
    operation: upperEnum(["BUY", "RENT", "SELL", "APPRAISAL"] as const).optional(),
    propertyType: optionalText(80),
    zone: optionalText(120),
    budgetMin: z.number().int().nonnegative().max(2_000_000_000).optional(),
    budgetMax: z.number().int().nonnegative().max(2_000_000_000).optional(),
    budgetCurrency: z
      .string()
      .trim()
      .length(3)
      .transform((value) => value.toUpperCase())
      .refine((value) => /^[A-Z]{3}$/.test(value), "invalid currency code")
      .optional(),
    bedrooms: z.number().int().nonnegative().max(100).optional(),
    timeline: optionalText(160),
    notes: optionalText(4000),
  })
  .strict()
  .superRefine((lead, context) => {
    if (
      lead.budgetMin !== undefined &&
      lead.budgetMax !== undefined &&
      lead.budgetMin > lead.budgetMax
    ) {
      context.addIssue({
        code: "custom",
        path: ["budgetMax"],
        message: "budgetMax must be greater than or equal to budgetMin",
      });
    }

    if (lead.status !== "QUALIFIED") return;

    for (const field of ["name", "operation", "propertyType", "zone"] as const) {
      if (!lead[field]) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: `${field} is required for a qualified lead`,
        });
      }
    }

    if (
      (lead.operation === "BUY" || lead.operation === "RENT") &&
      lead.budgetMin === undefined &&
      lead.budgetMax === undefined
    ) {
      context.addIssue({
        code: "custom",
        path: ["budgetMax"],
        message: "a budget is required for a qualified buy or rent lead",
      });
    }

  });

export type HermesLeadPayload = z.infer<typeof payloadSchema>;

function normalizeForMatching(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function resolveAdvisorName(operation?: string, zone?: string) {
  if (zone && normalizeForMatching(zone).includes("la barra")) {
    return "Juan López";
  }
  if (operation === "RENT") return "Tamara Ríos";
  if (["BUY", "SELL", "APPRAISAL"].includes(operation ?? "")) {
    return "Martín Ferreyra";
  }
  return undefined;
}

export function resolveAdvisorUpdate(
  input: HermesLeadPayload,
  merged: HermesLeadPayload,
) {
  const routingChanged =
    input.operation !== undefined || input.zone !== undefined;
  if (!routingChanged) return undefined;
  return resolveAdvisorName(merged.operation, merged.zone) ?? null;
}

export function verifyInternalBearerToken(
  authorization: string | null,
  expectedToken: string | undefined,
) {
  if (!authorization?.startsWith("Bearer ") || !expectedToken) return false;
  const supplied = Buffer.from(authorization.slice("Bearer ".length), "utf8");
  const expected = Buffer.from(expectedToken, "utf8");
  if (supplied.length !== expected.length) return false;
  return timingSafeEqual(supplied, expected);
}

export function parseHermesLeadPayload(input: unknown) {
  const parsed = payloadSchema.safeParse(input);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  return {
    success: true as const,
    data: {
      externalId: data.externalId,
      name: data.name,
      phone: data.phone,
      status: data.status,
      operation: data.operation,
      propertyType: data.propertyType,
      zone: data.zone,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      budgetCurrency: data.budgetCurrency,
      bedrooms: data.bedrooms,
      timeline: data.timeline,
      notes: data.notes,
    },
  };
}

type ExistingHermesLeadState = Partial<{
  [Key in Exclude<keyof HermesLeadPayload, "externalId">]:
    | HermesLeadPayload[Key]
    | null;
}>;

export function mergeAndValidateHermesLeadPayload(
  input: HermesLeadPayload,
  existing?: ExistingHermesLeadState | null,
) {
  return parseHermesLeadPayload({
    externalId: input.externalId,
    name: input.name ?? existing?.name ?? undefined,
    phone: input.phone ?? existing?.phone ?? undefined,
    status: input.status ?? existing?.status ?? "QUALIFYING",
    operation: input.operation ?? existing?.operation ?? undefined,
    propertyType: input.propertyType ?? existing?.propertyType ?? undefined,
    zone: input.zone ?? existing?.zone ?? undefined,
    budgetMin: input.budgetMin ?? existing?.budgetMin ?? undefined,
    budgetMax: input.budgetMax ?? existing?.budgetMax ?? undefined,
    budgetCurrency:
      input.budgetCurrency ?? existing?.budgetCurrency ?? undefined,
    bedrooms: input.bedrooms ?? existing?.bedrooms ?? undefined,
    timeline: input.timeline ?? existing?.timeline ?? undefined,
    notes: input.notes ?? existing?.notes ?? undefined,
  });
}

export class HermesLeadValidationError extends Error {
  constructor() {
    super("Merged lead data is invalid");
    this.name = "HermesLeadValidationError";
  }
}

type SavedHermesLead = {
  id: string;
  status: string;
  advisorName?: string | null;
};

type SaveHermesLead = (input: HermesLeadPayload) => Promise<SavedHermesLead>;

export function createHermesLeadPostHandler(
  saveLead: SaveHermesLead,
  expectedToken: string | undefined,
) {
  return async function postHermesLead(request: Request) {
    if (!verifyInternalBearerToken(request.headers.get("authorization"), expectedToken)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = parseHermesLeadPayload(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid lead payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    try {
      const lead = await saveLead(parsed.data);
      return Response.json({ ok: true, lead });
    } catch (error) {
      if (error instanceof HermesLeadValidationError) {
        return Response.json({ error: "Invalid merged lead data" }, { status: 400 });
      }
      console.error("[hermes-leads] Failed to save lead", error);
      return Response.json({ error: "Unable to save lead" }, { status: 500 });
    }
  };
}
