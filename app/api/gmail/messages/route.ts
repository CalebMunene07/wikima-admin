export const runtime = "edge";
// GET /api/gmail/messages?folder=inbox&search=&pageToken=
import { NextRequest, NextResponse } from "next/server";
async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `client_id=${encodeURIComponent(process.env.GMAIL_CLIENT_ID!)}&client_secret=${encodeURIComponent(process.env.GMAIL_CLIENT_SECRET!)}&refresh_token=${encodeURIComponent(process.env.GMAIL_REFRESH_TOKEN!)}&grant_type=refresh_token`,
  });
  const data = await res.json();
  console.error("Token response:", data);
  if (!data.access_token) throw new Error(data.error_description || data.error || "Failed to get access token");
  return data.access_token;
}
function getHeader(headers: { name: string; value: string }[], name: string) {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder    = searchParams.get("folder") || "inbox";
    const search    = searchParams.get("search") || "";
    const pageToken = searchParams.get("pageToken") || "";
    const folderQuery: Record<string, string> = {
      inbox:   "in:inbox",
      sent:    "in:sent",
      starred: "is:starred",
      trash:   "in:trash",
    };
    const q = [folderQuery[folder], search].filter(Boolean).join(" ");
    const token = await getAccessToken();
    const listParams = new URLSearchParams({ maxResults: "20" });
    if (q) listParams.set("q", q);
    if (pageToken) listParams.set("pageToken", pageToken);
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${listParams}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const listData = await listRes.json();
    if (!listRes.ok) throw new Error(listData.error?.message || "Failed to list messages");
    const messages: { id: string }[] = listData.messages || [];
    const nextPageToken: string | undefined = listData.nextPageToken;
    // Fetch metadata for each message in parallel
    const details = await Promise.all(
      messages.map((m) =>
        fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).then((r) => r.json())
      )
    );
    const emails = details.map((msg: any) => {
      const headers: { name: string; value: string }[] = msg.payload?.headers || [];
      return {
        id: msg.id,
        threadId: msg.threadId,
        subject: getHeader(headers, "Subject") || "(no subject)",
        from: getHeader(headers, "From"),
        to: getHeader(headers, "To"),
        date: getHeader(headers, "Date"),
        snippet: msg.snippet || "",
        labelIds: msg.labelIds || [],
        isUnread: (msg.labelIds || []).includes("UNREAD"),
        isStarred: (msg.labelIds || []).includes("STARRED"),
      };
    });
    return NextResponse.json({ emails, nextPageToken });
  } catch (err: any) {
    console.error("Gmail list error:", err);
    return NextResponse.json({ error: err.message || "Gmail error" }, { status: 500 });
  }
}
