// Cliente del modelo de IA (LLM). Usamos el formato estándar de OpenAI, que
// la mayoría de proveedores baratos aceptan. Por defecto apunta a Google Gemini.
//
// Para cambiar de proveedor, solo edita estas 3 variables en el .env:
//   LLM_API_KEY, LLM_BASE_URL, LLM_MODEL
// Ejemplos:
//   Gemini     → BASE_URL https://generativelanguage.googleapis.com/v1beta/openai/  MODEL gemini-2.0-flash
//   OpenAI     → BASE_URL (vacío)                        MODEL gpt-4o-mini
//   OpenRouter → BASE_URL https://openrouter.ai/api/v1   MODEL meta-llama/llama-3.3-70b-instruct:free
//   DeepSeek   → BASE_URL https://api.deepseek.com       MODEL deepseek-chat
import OpenAI from "openai";

// Creamos el cliente solo la primera vez que se usa (no al arrancar la app),
// para que la compilación no falle aunque todavía no haya API key.
let client: OpenAI | null = null;

export function getLLM(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.LLM_API_KEY,
      baseURL:
        process.env.LLM_BASE_URL ||
        "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
  }
  return client;
}

// Modelo a usar. Configurable en el .env (LLM_MODEL).
export const MODEL = process.env.LLM_MODEL || "gemini-2.5-flash";
