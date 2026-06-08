// app/api/gmail/messages/route.ts
// GET  /api/gmail/messages?folder=inbox&page=1&search=
// Returns paginated email list

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// FIX 1: Change runtime from "edge" to "nodejs" to support native Node modules (http/https)
export const runtime = "nodejs";

function getOAuth2Client() {
  // FIX 2: Use the already imported 'google' object instead of throwing with a CommonJS require()
  return new google.auth.OAuth2(
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

function extractBody(payload: any): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data)
    return decodeBase64(payload.body.data);
  if (payload.mimeType === "text/html" && payload.body?.data)
    return decodeBase64(payload.body.data);
  if (payload.parts) {
    // Prefer plain text
    const plain = payload.parts.find((p: any) => p.mimeType === "text/plain");
    if (plain?.body?.data) return decodeBase64(plain.body.data);
    const html = payload.parts.find((p: any) => p.mimeType === "text/html");
    if (html?.body?.data) return decodeBase64(html.body.data);
    // Recurse into multipart
    for (const part of payload.parts) {
      const body = extractBody(part);
      if (body) return body;
    }
  }
  return "";
}

function getHeader(headers: any[], name: string) {
  return headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder  = searchParams.get("folder") || "inbox";
    const search  = searchParams.get("search") || "";
    const pageToken = searchParams.get("pageToken") || undefined;

    const labelMap: Record<string, string> = {
      inbox: "INBOX",
      sent: "SENT",
      starred: "STARRED",
      trash: "TRASH",
    };

    const gmail = await getGmailClient();

    let q = search;
    if (folder === "inbox") q = `in:inbox ${q}`.trim();
    if (folder === "sent")  q = `in:sent ${q}`.trim();
    if (folder === "starred") q = `is:starred ${q}`.trim();

    const listRes = await gmail.users.messages.list({
      userId: "me",
      q: q || undefined,
      labelIds: labelMap[folder] ? [labelMap[folder]] : undefined,
      maxResults: 20,
      pageToken,
    });

    const messages = listRes.data.messages || [];
    const nextPageToken = listRes.data.nextPageToken;

    // Fetch message details in parallel (snippet + headers only for list view)
    const details = await Promise.all(
      messages.map((m: any) =>
        gmail.users.messages.get({
          userId: "me",
          id: m.id,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "To", "Date"],
        })
      )
    );

    const emails = details.map((d: any) => {
      const msg = d.data;
      const headers = msg.payload?.headers || [];
      return {
        id: msg.id,
        threadId: msg.threadId,
        subject: getHeader(headers, "Subject") || "(no subject)",
        from: getHeader(headers, "From"),
        to: getHeader(headers, "To"),
        date: getHeader(headers, "Date"),
        snippet: msg.snippet || "",
        labelIds: msg.labelIds || [],
        isUnread: msg.labelIds?.includes("UNREAD"),
        isStarred: msg.labelIds?.includes("STARRED"),
      };
    });

    return NextResponse.json({ emails, nextPageToken });
  } catch (err: any) {
    console.error("Gmail list error:", err);
    return NextResponse.json({ error: err.message || "Gmail error" }, { status: 500 });
  }
}
