"use client";

// Panel de Configuración (cliente): switches para prender/apagar cada canal y
// para elegir quién maneja las conversaciones (esta app con Gemini, o Hermes).
// Cada cambio se guarda al toque con una server action (estado optimista).
import { useState, useTransition } from "react";
import type { ComponentType } from "react";
import type { Channel, ConversationRuntime } from "@prisma/client";
import { SiWhatsapp, SiMessenger, SiInstagram } from "react-icons/si";
import { Bot, Cpu } from "lucide-react";
import { channelNames } from "@/lib/labels";
import { setChannelEnabled, setRuntime } from "@/app/(dashboard)/configuracion/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const channelIcons: Record<Channel, ComponentType<{ className?: string }>> = {
  WHATSAPP: SiWhatsapp,
  MESSENGER: SiMessenger,
  INSTAGRAM: SiInstagram,
};

const CHANNELS: Channel[] = ["WHATSAPP", "MESSENGER", "INSTAGRAM"];

export function SettingsPanel({
  channels,
  runtime,
}: {
  channels: Record<Channel, boolean>;
  runtime: ConversationRuntime;
}) {
  const [channelState, setChannelState] = useState(channels);
  const [runtimeState, setRuntimeState] = useState(runtime);
  const [, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-6">
      {/* --- Canales --- */}
      <Card>
        <CardHeader>
          <CardTitle>Canales</CardTitle>
          <CardDescription>
            Cuando un canal está apagado, la app ignora los mensajes que llegan por él:
            no crea prospectos ni responde.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {CHANNELS.map((channel) => {
            const Icon = channelIcons[channel];
            const enabled = channelState[channel];
            return (
              <div key={channel} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <Label
                  htmlFor={`channel-${channel}`}
                  className="flex items-center gap-2.5 font-normal"
                >
                  <Icon className="size-5 text-muted-foreground" />
                  <span>{channelNames[channel]}</span>
                </Label>
                <Switch
                  id={`channel-${channel}`}
                  checked={enabled}
                  onCheckedChange={(checked) => {
                    setChannelState((prev) => ({ ...prev, [channel]: checked }));
                    startTransition(async () => {
                      await setChannelEnabled(channel, checked);
                    });
                  }}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* --- Motor de conversaciones --- */}
      <Card>
        <CardHeader>
          <CardTitle>Motor de conversaciones</CardTitle>
          <CardDescription>
            Elegí quién responde automáticamente los mensajes entrantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <Label
              htmlFor="runtime"
              className="flex items-center gap-2.5 font-normal"
            >
              {runtimeState === "HERMES" ? (
                <Cpu className="size-5 text-muted-foreground" />
              ) : (
                <Bot className="size-5 text-muted-foreground" />
              )}
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">
                  {runtimeState === "HERMES" ? "Hermes" : "Gemini (esta app)"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {runtimeState === "HERMES"
                    ? "Hermes maneja las conversaciones. La app registra los mensajes pero no responde."
                    : "La app responde sola con el modelo Gemini."}
                </span>
              </span>
            </Label>
            <Switch
              id="runtime"
              checked={runtimeState === "HERMES"}
              onCheckedChange={(checked) => {
                const next: ConversationRuntime = checked ? "HERMES" : "GEMINI";
                setRuntimeState(next);
                startTransition(async () => {
                  await setRuntime(next);
                });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
