// El cerebro del agente: recibe el historial de la conversación y los datos
// actuales del lead, llama al LLM (manejando el uso de la herramienta) y
// devuelve la respuesta de texto + los datos del lead actualizados.
import type OpenAI from "openai";
import { getLLM, MODEL } from "@/lib/llm";
import { buildSystemPrompt } from "./prompt";
import { updateLeadTool, type LeadData } from "./types";

// Mensaje de la conversación SIN el system (ese lo generamos en cada llamada).
export type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export type AgentTurnInput = {
  // Historial de la conversación. El último mensaje debe ser el del usuario.
  messages: ChatMessage[];
  // Datos conocidos del lead hasta ahora.
  lead: LeadData;
};

export type AgentTurnResult = {
  reply: string;
  lead: LeadData;
  // Historial actualizado (incluye la respuesta del asistente), por si quieres
  // persistirlo tal cual.
  messages: ChatMessage[];
};

// Quita campos vacíos de lo que devolvió la herramienta.
function clean(input: Record<string, unknown>): Partial<LeadData> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return out as Partial<LeadData>;
}

export async function runAgentTurn({
  messages,
  lead,
}: AgentTurnInput): Promise<AgentTurnResult> {
  const convo: ChatMessage[] = [...messages];
  let leadData: LeadData = { ...lead };

  // Bucle: si el modelo usa la herramienta, aplicamos los datos y le devolvemos
  // el resultado para que continúe hasta dar su respuesta final.
  while (true) {
    const res = await getLLM().chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      tools: [updateLeadTool],
      messages: [
        { role: "system", content: buildSystemPrompt(leadData) },
        ...convo,
      ],
    });

    const msg = res.choices[0].message;
    convo.push(msg);

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      for (const tc of msg.tool_calls) {
        if (tc.type !== "function") continue;
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(tc.function.arguments || "{}");
        } catch {
          // si el modelo manda JSON inválido, lo ignoramos en vez de romper
        }
        leadData = { ...leadData, ...clean(args) };
        convo.push({
          role: "tool",
          tool_call_id: tc.id,
          content: "Datos del lead guardados correctamente.",
        });
      }
      continue;
    }

    // Respuesta final de texto.
    const reply = (msg.content || "").trim();
    return { reply, lead: leadData, messages: convo };
  }
}
