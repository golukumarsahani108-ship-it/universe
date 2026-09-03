import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function isValidUsername(username: string) {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

function createInternalEmail(username: string) {
  return `${username}@username.my-little-universe.local`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = normalizeUsername(
      String(body.username ?? "")
    );

    const password = String(body.password ?? "");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required." },
        { status: 400 }
      );
    }

    if (!isValidUsername(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-20 characters and use only letters, numbers or underscore.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    /*
     * Check username
     */
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 }
      );
    }

    /*
     * Internal email is only used by Supabase Auth.
     * User never has to type it.
     */
    const internalEmail =
      createInternalEmail(username);

    const { data, error } =
      await supabase.auth.signUp({
        email: internalEmail,
        password,
        options: {
          data: {
            username,
          },
        },
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Account could not be created." },
        { status: 400 }
      );
    }

    /*
     * If email confirmation is enabled,
     * session may be null.
     *
     * For this username-only auth design,
     * disable email confirmation in Supabase Auth.
     */

    const { error: profileError } =
      await supabase.from("profiles").insert({
        id: data.user.id,
        username,
      });

    if (profileError) {
      /*
       * Account was created but profile wasn't.
       * Tell the user clearly.
       */
      return NextResponse.json(
        {
          error:
            "Account was created, but the profile could not be created. Please contact support.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      username,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}