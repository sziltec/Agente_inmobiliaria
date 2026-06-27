"use client";

// Formulario para dar de alta un agente/admin nuevo.
import { useActionState } from "react";
import { createAgent, type CreateAgentState } from "@/app/(dashboard)/agentes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: CreateAgentState = {};

export function AgentForm() {
  const [state, formAction, pending] = useActionState(createAgent, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" placeholder="María Pérez" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="maria@tu-agencia.com" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select name="role" defaultValue="AGENT" items={{ AGENT: "Agente", ADMIN: "Administrador" }}>
          <SelectTrigger id="role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AGENT">Agente</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Creando..." : "Crear agente"}
      </Button>
    </form>
  );
}
