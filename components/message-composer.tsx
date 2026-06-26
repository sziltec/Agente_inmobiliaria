"use client";

// Caja para responder manualmente una conversación desde el dashboard.
import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { sendMessage, type SendMessageState } from "@/app/messages/actions";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";

const initialState: SendMessageState = {};

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const action = sendMessage.bind(null, conversationId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // El mensaje se guarda salvo que el error sea de validación (texto
    // vacío o conversación inexistente). En esta versión de Next.js,
    // router.refresh() no refresca de forma confiable una ruta anidada
    // bajo un layout persistente (mismo problema que <Link> en el sidebar):
    // forzamos una recarga completa, que sí funciona siempre.
    if (state !== initialState && !state.error) {
      window.location.reload();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="border-t p-4">
      {state.error && <p className="mb-2 text-sm text-destructive">{state.error}</p>}
      {state.warning && <p className="mb-2 text-sm text-muted-foreground">{state.warning}</p>}
      <InputGroup>
        <InputGroupTextarea
          name="text"
          placeholder="Escribí un mensaje..."
          required
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="submit" size="icon-sm" disabled={pending}>
            <Send />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
