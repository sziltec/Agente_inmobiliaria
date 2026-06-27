"use client";

// Selector de agente asignado a un lead, en la fila de la tabla de
// Prospectos. Solo se renderiza interactivo para el rol ADMIN (ver
// leads-table.tsx); los demás roles ven el nombre como texto.
import { useState, useTransition } from "react";
import type { Channel } from "@prisma/client";
import { assignLead } from "@/app/(dashboard)/leads/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UNASSIGNED = "unassigned";

export function LeadAgentSelect({
  leadId,
  channel,
  agentId,
  agents,
}: {
  leadId: string;
  channel: Channel;
  agentId: string | null;
  agents: { id: string; name: string }[];
}) {
  const [value, setValue] = useState(agentId ?? UNASSIGNED);
  const [, startTransition] = useTransition();

  // Se pasa `items` para que <SelectValue> resuelva el label del valor
  // seleccionado sin depender de que el popup ya se haya abierto/montado.
  const items: Record<string, string> = {
    [UNASSIGNED]: "Sin asignar",
    ...Object.fromEntries(agents.map((agent) => [agent.id, agent.name])),
  };

  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => {
        const nextValue = next ?? UNASSIGNED;
        setValue(nextValue);
        startTransition(async () => {
          await assignLead(leadId, nextValue === UNASSIGNED ? null : nextValue, channel);
        });
      }}
    >
      <SelectTrigger size="sm" className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>Sin asignar</SelectItem>
        {agents.map((agent) => (
          <SelectItem key={agent.id} value={agent.id}>
            {agent.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
