import { NextResponse } from "next/server";

type SupportType =
  | "Feature Request"
  | "Bug Report"
  | "Support"
  | "Other";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const type = body?.type as SupportType;
    const message = String(body?.message || "").trim();
    const email = String(body?.email || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    if (message.length < 5) {
      return NextResponse.json(
        { error: "Message is too short." },
        { status: 400 }
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
        { error: "Message is too long." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const supportEmail = process.env.SUPPORT_EMAIL;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      "onboarding@resend.dev";

    if (!apiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured." },
        { status: 500 }
      );
    }

    if (!supportEmail) {
      return NextResponse.json(
        { error: "SUPPORT_EMAIL is not configured." },
        { status: 500 }
      );
    }

    const safeType =
      type || "Other";

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#263640;">
        <h2>My Little Universe — ${safeType}</h2>

        <p>
          <strong>Type:</strong> ${safeType}
        </p>

        ${
          email
            ? `<p><strong>User Email:</strong> ${escapeHtml(email)}</p>`
            : `<p><strong>User Email:</strong> Not provided</p>`
        }

        <hr />

        <h3>Message</h3>

        <p style="white-space:pre-wrap;">
          ${escapeHtml(message)}
        </p>

        <hr />

        <p style="color:#71828c;font-size:13px;">
          Sent from My Little Universe Support.
        </p>
      </div>
    `;

    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [supportEmail],
          subject: `[My Little Universe] ${safeType}`,
          html,
          ...(email ? { reply_to: email } : {}),
        }),
      }
    );

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", resendData);

      return NextResponse.json(
        {
          error:
            resendData?.message ||
            "Email could not be sent.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Support message sent successfully.",
    });
  } catch (error) {
    console.error("Support API error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}