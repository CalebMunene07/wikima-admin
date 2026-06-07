// app/api/gmail/messages/[id]/route.ts
// GET /api/gmail/messages/[id]  — full message body
// PATCH /api/gmail/messages/[id] — mark read/unread/starred

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "edge";

function getOAuth2Client() {
  const { OAuth2 } = require("googleapis").google.auth;
  return new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
}

async function getGmailClient() {
  const auth = getOAuth2Client();
  auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: "v1", auth });
}

function decodeBase64(str: string) {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

function extractBody(payload: any): { text: string; html: string } {
  let text = "", html = "";
  if (!payload) return { text, html };

  if (payload.mimeType === "text/plain" && payload.body?.data)
    text = decodeBase64(payload.body.data);
  if (payload.mimeType === "text/html" && payload.body?.data)
    html = decodeBase64(payload.body.data);

  if (payload.parts) {
    for (const part of payload.parts) {
      const sub = extractBody(part);
      if (!text && sub.text) text = sub.text;
      if (!html && sub.html) html = sub.html;
    }
  }
  return { text, html };
}

function getHeader(headers: any[], name: string) {
  return headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gmail = await getGmailClient();
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: params.id,
      format: "full",
    });

    const headers = msg.data.payload?.headers || [];
    const { text, html } = extractBody(msg.data.payload);

    // Mark as read
    if (msg.data.labelIds?.includes("UNREAD")) {
      await gmail.users.messages.modify({
        userId: "me",
        id: params.id,
        requestBody: { removeLabelIds: ["UNREAD"] },
      });
    }

    return NextResponse.json({
      id: msg.data.id,
      threadId: msg.data.threadId,
      subject: getHeader(headers, "Subject") || "(no subject)",
      from: getHeader(headers, "From"),
      to: getHeader(headers, "To"),
      cc: getHeader(headers, "Cc"),
      date: getHeader(headers, "Date"),
      bodyText: text,
      bodyHtml: html,
      labelIds: msg.data.labelIds || [],
      isStarred: msg.data.labelIds?.includes("STARRED"),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action } = await req.json();
    const gmail = await getGmailClient();

    if (action === "star") {
      await gmail.users.messages.modify({ userId: "me", id: params.id, requestBody: { addLabelIds: ["STARRED"] } });
    } else if (action === "unstar") {
      await gmail.users.messages.modify({ userId: "me", id: params.id, requestBody: { removeLabelIds: ["STARRED"] } });
    } else if (action === "markUnread") {
      await gmail.users.messages.modify({ userId: "me", id: params.id, requestBody: { addLabelIds: ["UNREAD"] } });
    } else if (action === "trash") {
      await gmail.users.messages.trash({ userId: "me", id: params.id });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
