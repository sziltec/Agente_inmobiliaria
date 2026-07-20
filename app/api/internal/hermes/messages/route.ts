import {
  createHermesMessagePostHandler,
  createHermesMessageStatusHandler,
} from "@/lib/internal/hermes-message";
import {
  getHermesConversationStatus,
  saveHermesMessage,
} from "@/lib/internal/save-hermes-message";

export const GET = createHermesMessageStatusHandler(
  getHermesConversationStatus,
  process.env.HERMES_CRM_API_TOKEN,
);

export const POST = createHermesMessagePostHandler(
  saveHermesMessage,
  process.env.HERMES_CRM_API_TOKEN,
);
