import { createHermesLeadPostHandler } from "@/lib/internal/hermes-lead";
import { saveHermesLead } from "@/lib/internal/save-hermes-lead";

export const runtime = "nodejs";

export const POST = createHermesLeadPostHandler(
  saveHermesLead,
  process.env.HERMES_CRM_API_TOKEN,
);
