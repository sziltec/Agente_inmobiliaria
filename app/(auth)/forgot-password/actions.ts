"use server";

import { headers } from "next/headers";
import { normalizeRecoveryEmail } from "@/lib/auth/password-reset";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ForgotPasswordState = { message?: string; error?: string };

export async function requestPasswordReset(
  _previous: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = normalizeRecoveryEmail(String(formData.get("email") ?? ""));
  if (!email) return { error: "Ingresá un email válido." };

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  if (!host) return { error: "No pudimos generar el enlace de recuperación." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${protocol}://${host}/auth/callback?next=/reset-password`,
  });

  if (error) return { error: "No pudimos enviar el email. Intentá nuevamente." };
  return {
    message:
      "Si la cuenta existe, vas a recibir un email con el enlace para cambiar la contraseña.",
  };
}
