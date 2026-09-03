import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const cleanUsername = String(username ?? "")
      .trim()
      .toLowerCase();

    const cleanPassword = String(password ?? "");

    if (!cleanUsername) {
      return NextResponse.json(
        { error: "Username is required." },
        { status: 400 }
      );
    }

    if (!cleanPassword) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    /*
     * Username se profile find karo.
     */
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    /*
     * Auth user ka email server-side retrieve karo.
     *
     * Iske liye service-role key server par hi honi chahiye.
     */
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      return NextResponse.json(
        { error: "Server authentication is not configured." },
        { status: 500 }
      );
    }

    const admin = await import("@supabase/supabase-js");

    const adminClient =
      admin.createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

    const {
      data: userData,
      error: userError,
    } =
      await adminClient.auth.admin.getUserById(
        profile.id
      );

    if (userError || !userData.user?.email) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    /*
     * Normal Supabase password login.
     */
    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: cleanPassword,
      });

    if (loginError) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      username: cleanUsername,
    });
  } catch (error) {
    console.error("Username login error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}