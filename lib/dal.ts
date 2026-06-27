// Capa de acceso a datos para autenticación: centraliza la verificación de
// sesión y la carga del perfil (rol/nombre) para el resto de la app.
import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export const verifySession = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return data.user;
});

export const getCurrentUser = cache(async () => {
  const user = await verifySession();
  return db.profile.findUnique({ where: { id: user.id } });
});
