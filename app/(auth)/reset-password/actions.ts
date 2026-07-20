"use server";

import { validateNewPassword } from "@/lib/auth/password-reset";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ResetPasswordState = { success?: boolean; error?: string };

export async function updatePassword(
  _previous: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  const validation = validateNewPassword(password, confirmation);
  if (!validation.valid) return { error: validation.error };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "No pudimos actualizar la contraseña." };

  return { success: true };
}
