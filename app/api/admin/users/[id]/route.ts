import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  let body: {
    action?: "disable" | "enable" | "delete";
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!body.action) {
    return NextResponse.json(
      { error: "Missing action" },
      { status: 400 }
    );
  }

  if (id === admin.id && body.action === "delete") {
    return NextResponse.json(
      { error: "You cannot delete the currently authenticated admin." },
      { status: 400 }
    );
  }

  if (body.action === "disable") {
    const { error } =
      await supabaseAdmin.auth.admin.updateUserById(
        id,
        {
          ban_duration: "876000h",
        }
      );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }

  if (body.action === "enable") {
    const { error } =
      await supabaseAdmin.auth.admin.updateUserById(
        id,
        {
          ban_duration: "none",
        }
      );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }

  if (body.action === "delete") {
    const { error } =
      await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
  });
}