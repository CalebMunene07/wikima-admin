// app/api/gmail/send/route.ts
// POST /api/gmail/send
// Body: { to, subject, body, threadId?, from? }
// Supports replying in-thread and sending from custom aliases

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "edge";

async function getGmailClient() {
  const { OAuth2 } = require("googleapis").google.auth;
  const auth = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
  auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: "v1", auth });
}

function makeRawEmail({
  from, to, cc, subject, body, threadId, inReplyTo, references,
}: {
  from: string; to: string; cc?: string; subject: string; body: string;
  threadId?: string; inReplyTo?: string; references?: string;
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

  return Buffer.from(lines)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function POST(req: NextRequest) {
  try {
    const {
      to, cc, subject, body, threadId, inReplyTo, references,
      fromAlias,   // e.g. "info@wikimasafari.com" or "reservations@wikimasafari.com"
    } = await req.json();

    if (!to || !subject || !body)
      return NextResponse.json({ error: "Missing required fields: to, subject, body" }, { status: 400 });

    const gmail = await getGmailClient();

    // Determine sender — use alias if provided, else default Gmail
    const fromEmail = fromAlias
      ? `Wikima Safari <${fromAlias}>`
      : `Wikima Safari <${process.env.GMAIL_USER_EMAIL}>`;

    const raw = makeRawEmail({
      from: fromEmail, to, cc, subject,
      body: body.replace(/\n/g, "<br>"),
      inReplyTo, references,
    });

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw,
        threadId: threadId || undefined,
      },
    });

    return NextResponse.json({ messageId: res.data.id, threadId: res.data.threadId });
  } catch (err: any) {
    console.error("Gmail send error:", err);
    return NextResponse.json({ error: err.message || "Send failed" }, { status: 500 });
  }
}
