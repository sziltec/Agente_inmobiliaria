// Prueba el agente desde la terminal, sin redes sociales ni base de datos.
// Ejecutar con:  npm run agent:test
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { runAgentTurn, type ChatMessage } from "@/lib/agent/agent";
import type { LeadData } from "@/lib/agent/types";

async function main() {
  if (!process.env.LLM_API_KEY) {
    console.error(
      "\n⚠️  Falta LLM_API_KEY en tu archivo .env. Consíguela en https://aistudio.google.com (Gemini) y pégala ahí.\n",
    );
    process.exit(1);
  }

  const rl = readline.createInterface({ input, output });
  const messages: ChatMessage[] = [];
  let lead: LeadData = {};

  console.log("\n🏠 Agente inmobiliario (escribe 'salir' para terminar)\n");

  // Saludo inicial: simulamos que el cliente abre el chat con un "Hola".
  let userText = "Hola";

  while (true) {
    if (userText.toLowerCase() === "salir") break;

    messages.push({ role: "user", content: userText });
    const result = await runAgentTurn({ messages, lead });
    lead = result.lead;
    // Reemplazamos el historial por el actualizado (incluye respuesta del bot).
    messages.length = 0;
    messages.push(...result.messages);

    console.log(`\n🤖 ${result.reply}\n`);
    console.log(`   [datos lead: ${JSON.stringify(lead)}]`);

    userText = await rl.question("\n🧑 Tú: ");
  }

  rl.close();
  console.log("\n¡Hasta luego!\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
