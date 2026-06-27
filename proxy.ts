// Protección de rutas del dashboard. En esta versión de Next.js esto se
// llama "Proxy" (antes "Middleware"): el archivo va en la raíz del proyecto
// y exporta `proxy()`, no `middleware()`.
//
// Refresca la sesión de Supabase en cada request (los access tokens
// expiran) y redirige según si hay sesión o no. Usa getUser() y no
// getSession(): getUser() revalida contra el servidor de Supabase, mientras
// que getSession() confía en la cookie local sin validar.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = ["/login"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  if (!data.user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (data.user && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  // Las rutas de /api (webhooks de Meta) las llama Meta directo, sin cookie
  // de sesión: si el proxy las interceptara, se cae todo el pipeline del bot.
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)"],
};
