// Cliente de Supabase con la service role key, solo para uso en el servidor
// (subida de fotos al storage). Nunca importar esto desde un componente cliente.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const PROPERTIES_BUCKET = "properties";

// Construido recién al usarlo (no al importar el módulo): así no se evalúa
// durante el build/generación estática de páginas, solo cuando una request
// real lo necesita.
let client: SupabaseClient | undefined;

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return client;
}
