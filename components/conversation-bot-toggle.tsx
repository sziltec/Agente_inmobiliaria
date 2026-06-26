"use client";

// Switch del encabezado de una conversación: prende/apaga el agente IA para
// que un humano pueda tomar el chat por su cuenta sin que el bot responda.
import { useState, useTransition } from "react";
import { setBotEnabled } from "@/app/messages/actions";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function ConversationBotToggle({
  conversationId,
  initialEnabled,
}: {
  conversationId: string;
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="bot-enabled"
        checked={enabled}
        onCheckedChange={(checked) => {
          setEnabled(checked);
          startTransition(async () => {
            await setBotEnabled(conversationId, checked);
          });
        }}
      />
      <Label htmlFor="bot-enabled" className="text-sm text-muted-foreground">
        Bot
      </Label>
    </div>
  );
}
