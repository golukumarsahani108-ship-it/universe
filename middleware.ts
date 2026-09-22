import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

export async function middleware(
  request: NextRequest
) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  /*
   * Refresh Supabase authentication session.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname =
    request.nextUrl.pathname;

  /*
   * ============================================================
   * PROTECT /me
   * ============================================================
   */

  const isMeRoute =
    pathname === "/me" ||
    pathname.startsWith("/me/");

  if (isMeRoute && !user) {
    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname = "/login";
    loginUrl.search = "";

    loginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  /*
   * ============================================================
   * ADMIN LOGIN
   * ============================================================
   *
   * IMPORTANT:
   * /admin/login must ALWAYS remain public.
   *
   * Do not redirect this route from middleware.
   */

  const isAdminLoginRoute =
    pathname === "/admin/login";

  if (isAdminLoginRoute) {
    return response;
  }

  /*
   * ============================================================
   * PROTECT ADMIN ROUTES
   * ============================================================
   *
   * Middleware only verifies authentication.
   *
   * Actual admin role verification must happen
   * server-side inside requireAdmin().
   */

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (isAdminRoute && !user) {
    const adminLoginUrl =
      request.nextUrl.clone();

    adminLoginUrl.pathname =
      "/admin/login";

    adminLoginUrl.search = "";

    adminLoginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(
      adminLoginUrl
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/me/:path*",
    "/admin/:path*",
  ],
};