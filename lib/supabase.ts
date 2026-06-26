// Cliente de Supabase con la service role key, solo para uso en el servidor
// (subida de fotos al storage). Nunca importar esto desde un componente cliente.
import { createClient } from "@supabase/supabase-js";

export const PROPERTIES_BUCKET = "properties";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
