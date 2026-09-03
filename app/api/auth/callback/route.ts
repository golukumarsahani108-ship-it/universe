import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");

  let next =
    requestUrl.searchParams.get("next") || "/";

  // Security: only allow internal paths
  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost =
        request.headers.get("x-forwarded-host");

      const isLocal =
        process.env.NODE_ENV === "development";

      if (isLocal) {
        return NextResponse.redirect(
          `${requestUrl.origin}${next}`
        );
      }

      if (forwardedHost) {
        return NextResponse.redirect(
          `https://${forwardedHost}${next}`
        );
      }

      return NextResponse.redirect(
        `${requestUrl.origin}${next}`
      );
    }
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=auth`
  );
}