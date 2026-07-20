import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailOtpTypes = new Set<EmailOtpType>([
  "email",
  "invite",
  "magiclink",
  "recovery",
  "signup",
  "email_change",
]);

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : "/reset-password";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type");
  const supabase = await createSupabaseServerClient();

  let error = null;
  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && rawType && emailOtpTypes.has(rawType as EmailOtpType)) {
    ({ error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: rawType as EmailOtpType,
    }));
  } else {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (error) {
    return NextResponse.redirect(new URL("/login?recovery=expired", request.url));
  }
  return NextResponse.redirect(new URL(next, request.url));
}
