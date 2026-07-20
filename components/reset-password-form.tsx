"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  updatePassword,
  type ResetPasswordState,
} from "@/app/(auth)/reset-password/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  if (state.success) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-emerald-600">Contraseña actualizada correctamente.</p>
        <Button className="w-full" render={<Link href="/login" />}>
          Ir al login
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={12}
          autoComplete="new-password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmation">Repetir contraseña</Label>
        <Input
          id="confirmation"
          name="confirmation"
          type="password"
          minLength={12}
          autoComplete="new-password"
          required
        />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Guardando..." : "Guardar contraseña"}
      </Button>
    </form>
  );
}
