"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordReset,
  type ForgotPasswordState,
} from "@/app/(auth)/forgot-password/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-emerald-600">{state.message}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enviando..." : "Enviar enlace"}
      </Button>
      <Button variant="link" className="w-full" render={<Link href="/login" />}>
        Volver al login
      </Button>
    </form>
  );
}
