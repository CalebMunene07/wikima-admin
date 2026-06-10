export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
// app/api/gmail/messages/[id]/route.ts
// GET /api/gmail/messages/[id]  — full message body
// PATCH /api/gmail/messages/[id] — mark read/unread/starred/trash



// Lightweight URL-Safe Base64 decode using native browser/edge primitives
function decodeBase64(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binString = atob(base64);
  const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

// Exchange Refresh Token for a fresh Access Token via simple HTTP fetch
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

// Recursively parse MIME structures for raw text and html values
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = await getAccessToken();

    // Fetch full message raw object
    const msgResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const msgData = await msgResponse.json();
    if (!msgResponse.ok) throw new Error(msgData.error?.message || "Failed to fetch message details");

    const headers = msgData.payload?.headers || [];
    const { text, html } = extractBody(msgData.payload);

    // Auto mark as read if it possesses an active UNREAD state
    if (msgData.labelIds?.includes("UNREAD")) {
      await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ removeLabelIds: ["UNREAD"] }),
        }
      );
    }

    return NextResponse.json({
      id: msgData.id,
      threadId: msgData.threadId,
      subject: getHeader(headers, "Subject") || "(no subject)",
      from: getHeader(headers, "From"),
      to: getHeader(headers, "To"),
      cc: getHeader(headers, "Cc"),
      date: getHeader(headers, "Date"),
      bodyText: text,
      bodyHtml: html,
      labelIds: msgData.labelIds || [],
      isStarred: msgData.labelIds?.includes("STARRED"),
    });
  } catch (err: any) {
    console.error("Gmail detail GET error:", err);
    return NextResponse.json({ error: err.message || "Operation failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await req.json();
    const accessToken = await getAccessToken();

    let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`;
    let body: any = {};

    if (action === "star") {
      body = { addLabelIds: ["STARRED"] };
    } else if (action === "unstar") {
      body = { removeLabelIds: ["STARRED"] };
    } else if (action === "markUnread") {
      body = { addLabelIds: ["UNREAD"] };
    } else if (action === "trash") {
      url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const modifierResponse = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: action !== "trash" ? JSON.stringify(body) : undefined,
    });

    if (!modifierResponse.ok) {
      const errorData = await modifierResponse.json();
      throw new Error(errorData.error?.message || `Failed to execute patch action: ${action}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Gmail status PATCH error:", err);
    return NextResponse.json({ error: err.message || "Operation failed" }, { status: 500 });
  }
}
