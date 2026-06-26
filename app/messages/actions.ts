"use server";

// Acciones de la bandeja de Mensajes: responder manualmente una conversación
// (se guarda y se entrega por el canal de origen) y eliminar una conversación.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdapter } from "@/lib/channels";

// `error`: no se guardó nada (formulario inválido). `warning`: se guardó el
// mensaje pero no se pudo entregar por el canal (el composer lo distingue
// para saber si limpiar el campo de texto o no).
export type SendMessageState = { error?: string; warning?: string };

export async function sendMessage(
  conversationId: string,
  _prevState: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "Escribí un mensaje." };

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) return { error: "La conversación no existe." };

  await db.message.create({
    data: { conversationId, direction: "OUTBOUND", content: text },
  });
  await db.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");

  try {
    await getAdapter(conversation.channel).send(conversation.externalUserId, text);
  } catch (e) {
    console.error("No se pudo entregar el mensaje:", e);
    return { warning: "El mensaje quedó guardado, pero no se pudo entregar por el canal." };
  }

  return {};
}

export async function deleteConversation(conversationId: string) {
  // Los mensajes tienen ON DELETE RESTRICT hacia la conversación: hay que
  // borrarlos primero, en la misma transacción.
  await db.$transaction([
    db.message.deleteMany({ where: { conversationId } }),
    db.conversation.delete({ where: { id: conversationId } }),
  ]);

  revalidatePath("/messages");
  redirect("/messages");
}
