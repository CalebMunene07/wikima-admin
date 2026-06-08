// app/api/gmail/send/route.ts
// POST /api/gmail/send
// Body: { to, subject, body, threadId?, fromAlias? }
// Supports replying in-thread and sending from custom aliases securely on Cloudflare Pages

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Helper to encode to URL-Safe Base64 without requiring Node's Buffer
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// 1. Exchange the Refresh Token for a fresh Access Token using a standard web fetch
async function getAccessToken(): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID!,
      client_secret: process.env.GMAIL_CLIENT_SECRET!,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || "Failed to refresh Google access token.");
  }
  return data.access_token;
}

function makeRawEmail({
  from, to, cc, subject, body, inReplyTo, references,
}: {
  from: string; to: string; cc?: string; subject: string; body: string;
  inReplyTo?: string; references?: string;
}) {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    cc ? `Cc: ${cc}` : "",
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    inReplyTo  ? `In-Reply-To: ${inReplyTo}`   : "",
    references ? `References: ${references}`    : "",
    "",
    body,
  ].filter(Boolean).join("\r\n");

  return base64UrlEncode(lines);
}

export async function POST(req: NextRequest) {
  try {
    // 2. Authenticate the request against your Supabase session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 3. Process Request Parameters
    const {
      to, cc, subject, body, threadId, inReplyTo, references,
      fromAlias, // e.g. "info@wikimasafari.com"
    } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields: to, subject, body" }, { status: 400 });
    }

    // 4. Get active Access Token and build email payload
    const accessToken = await getAccessToken();
    const fromEmail = fromAlias
      ? `Wikima Safari <${fromAlias}>`
      : `Wikima Safari <${process.env.GMAIL_USER_EMAIL}>`;

    const raw = makeRawEmail({
      from: fromEmail, to, cc, subject,
      body: body.replace(/\n/g, "<br>"),
      inReplyTo, references,
    });

    // 5. Send message directly via Google Rest API
    const gmailResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw,
        threadId: threadId || undefined,
      }),
    });

    const gmailData = await gmailResponse.json();
    if (!gmailResponse.ok) {
      throw new Error(gmailData.error?.message || "Google API transmission error.");
    }

    return NextResponse.json({ messageId: gmailData.id, threadId: gmailData.threadId });
  } catch (err: any) {
    console.error("Gmail send error:", err);
    return NextResponse.json({ error: err.message || "Send failed" }, { status: 500 });
  }
}
