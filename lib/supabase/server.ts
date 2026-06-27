// Cliente de Supabase para Server Components / Server Actions / Route
// Handlers, con la sesión guardada en cookies (vía @supabase/ssr). Usa el
// anon key (no la service role key, que vive aparte en lib/supabase.ts y es
// solo para Storage).
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Se llamó desde un Server Component (no se pueden escribir
            // cookies ahí); proxy.ts ya se encarga de refrescar la sesión.
          }
        },
      },
    },
  );
}
