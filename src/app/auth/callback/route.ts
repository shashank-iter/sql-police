// app/auth/callback/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server"; // ← new import
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabaseClient(); // ← use server client + await
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Exchange error details:", error); // ← log this — check terminal!
      // Optional: redirect with error info, e.g. ?error=exchange_failed
    } else {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
