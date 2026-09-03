import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/login?error=missing_code",
        url.origin
      )
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(
      code
    );

  if (error) {
    console.error(
      "OAuth callback error:",
      error.message
    );

    return NextResponse.redirect(
      new URL(
        "/login?error=callback_failed",
        url.origin
      )
    );
  }

  /*
   * IMPORTANT:
   * Login successful -> directly open ME.
   */

  return NextResponse.redirect(
    new URL("/me", url.origin)
  );
}