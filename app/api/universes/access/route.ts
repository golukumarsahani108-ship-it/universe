import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const slug = String(body?.slug || "").trim();
    const password = String(body?.password || "");

    if (!slug || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Password is required.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: universe, error } = await supabase
      .from("universes")
      .select(
        `
          id,
          slug,
          password_enabled,
          password_hash
        `
      )
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      console.error("Universe access lookup error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify this universe.",
        },
        { status: 500 }
      );
    }

    if (!universe) {
      return NextResponse.json(
        {
          success: false,
          error: "Universe not found.",
        },
        { status: 404 }
      );
    }

    // No password protection.
    if (!universe.password_enabled) {
      return NextResponse.json({
        success: true,
        unlocked: true,
      });
    }

    if (!universe.password_hash) {
      return NextResponse.json(
        {
          success: false,
          error: "This universe has an invalid password configuration.",
        },
        { status: 500 }
      );
    }

    const isValid = await bcrypt.compare(
      password,
      universe.password_hash
    );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          unlocked: false,
          error: "Incorrect password. Try again ✨",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      unlocked: true,
    });
  } catch (error) {
    console.error("Universe access error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}