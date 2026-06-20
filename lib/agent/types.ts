// Tipos y definición de la "herramienta" (function calling) que usa el agente
// para guardar datos del lead a medida que los va descubriendo.
import type OpenAI from "openai";

// Datos de cualificación que el agente va completando.
export type LeadData = {
  name?: string;
  phone?: string;
  email?: string;
  operation?: "BUY" | "RENT";
  propertyType?: string;
  zone?: string;
  budgetMin?: number;
  budgetMax?: number;
  bedrooms?: number;
  timeline?: string;
  notes?: string;
  status?: "NEW" | "QUALIFYING" | "QUALIFIED" | "DISQUALIFIED";
};

// La función que el modelo invoca para registrar/actualizar datos del lead.
// Solo envía los campos que aprendió en ese momento.
export const updateLeadTool: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "actualizar_datos_lead",
    description:
      "Guarda o actualiza la información del cliente potencial (lead) a medida que la descubres en la conversación. Llama a esta función cada vez que el cliente te dé un dato nuevo (presupuesto, zona, tipo de propiedad, nombre, etc.). Envía únicamente los campos que conozcas en ese momento; deja el resto sin enviar.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre del cliente" },
        phone: { type: "string", description: "Teléfono de contacto si lo da" },
        email: { type: "string", description: "Correo electrónico si lo da" },
        operation: {
          type: "string",
          enum: ["BUY", "RENT"],
          description: "Si quiere COMPRAR (BUY) o ALQUILAR (RENT)",
        },
        propertyType: {
          type: "string",
          description: "Tipo de propiedad: casa, departamento, terreno, local, etc.",
        },
        zone: { type: "string", description: "Zona, barrio o ciudad de interés" },
        budgetMin: { type: "integer", description: "Presupuesto mínimo (número, sin símbolos)" },
        budgetMax: { type: "integer", description: "Presupuesto máximo (número, sin símbolos)" },
        bedrooms: { type: "integer", description: "Cantidad de dormitorios deseados" },
        timeline: {
          type: "string",
          description: "Plazo del cliente: 'en 1 mes', 'solo explorando', etc.",
        },
        notes: {
          type: "string",
          description: "Resumen breve y libre de lo más relevante del cliente",
        },
        status: {
          type: "string",
          enum: ["NEW", "QUALIFYING", "QUALIFIED", "DISQUALIFIED"],
          description:
            "Estado del lead. Usa QUALIFYING mientras recopilas datos, QUALIFIED cuando tengas operación + presupuesto + zona + tipo y haya intención real, DISQUALIFIED si es spam o no encaja.",
        },
      },
      required: [],
    },
  },
};
