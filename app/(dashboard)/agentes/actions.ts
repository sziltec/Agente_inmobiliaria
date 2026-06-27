"use server";

// Alta de agentes/admins del dashboard: crea el usuario en Supabase Auth y
// el perfil correspondiente (nombre/rol) en la base.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { getSupabaseAdmin } from "@/lib/supabase";

export type CreateAgentState = { error?: string };

export async function createAgent(
  _prevState: CreateAgentState,
  formData: FormData,
): Promise<CreateAgentState> {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "ADMIN") {
    return { error: "No autorizado." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "AGENT");

  if (!name || !email || !password) {
    return { error: "Completá todos los campos." };
  }
  if (password.length < 8) {
    return { error: "La contraseña tiene que tener al menos 8 caracteres." };
  }
  if (role !== "ADMIN" && role !== "AGENT") {
    return { error: "Rol inválido." };
  }

  const existing = await db.profile.findFirst({ where: { email } });
  if (existing) {
    return { error: "Ya existe un agente con ese email." };
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    return { error: `No se pudo crear el usuario: ${error?.message}` };
  }

  await db.profile.create({
    data: { id: data.user.id, email, name, role },
  });

  revalidatePath("/agentes");
  redirect("/agentes");
}
