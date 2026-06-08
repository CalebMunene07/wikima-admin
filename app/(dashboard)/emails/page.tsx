"use client";
// app/dashboard/emails/page.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Inbox, Send, Star, Trash2, Search, RefreshCw, Reply,
  ChevronLeft, MoreVertical, Paperclip, Download, X, Plus,
  Mail, Clock, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface EmailSummary {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  labelIds: string[];
  isUnread: boolean;
  isStarred: boolean;
}

interface EmailFull extends EmailSummary {
  cc: string;
  bodyText: string;
  bodyHtml: string;
}

type Folder = "inbox" | "sent" | "starred" | "trash";

const FROM_ALIASES = [
  { label: "info@wikimasafari.com",         value: "info@wikimasafari.com" },
  { label: "reservations@wikimasafari.com", value: "reservations@wikimasafari.com" },
  { label: "wikimasafari02@gmail.com",      value: "" }, // empty = default Gmail
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function parseName(from: string) {
  const match = from.match(/^(.+?)\s*<.*>$/);
  return match ? match[1].replace(/"/g, "").trim() : from.split("@")[0];
}

function parseEmail(from: string) {
  const match = from.match(/<(.+?)>/);
  return match ? match[1] : from;
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "#2d6a4f", "#1b4332", "#52796f", "#354f52", "#4a7c59",
  "#40916c", "#74c69d", "#1e6091", "#023e8a", "#7b2d8b",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ── Compose / Reply Modal ─────────────────────────────────────────────────────
const ComposeModal: React.FC<{
  replyTo?: EmailFull;
  onClose: () => void;
  onSent: () => void;
}> = ({ replyTo, onClose, onSent }) => {
  const [to,       setTo]       = useState(replyTo ? parseEmail(replyTo.from) : "");
  const [cc,       setCc]       = useState(replyTo?.cc || "");
  const [subject,  setSubject]  = useState(replyTo ? `Re: ${replyTo.subject}` : "");
  const [body,     setBody]     = useState("");
  const [fromAlias, setFrom]    = useState(FROM_ALIASES[0].value);
  const [sending,  setSending]  = useState(false);
  const [error,    setError]    = useState("");
  const [showCc,   setShowCc]   = useState(false);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      setError("To, Subject and Body are required."); return;
    }
    setSending(true); setError("");
    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to, cc: cc || undefined, subject, body,
          fromAlias,
          threadId: replyTo?.threadId,
          inReplyTo: replyTo?.id,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Send failed");
      onSent();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
      padding: "24px",
    }} onClick={onClose}>
      <div
        style={{
          width: 560, maxHeight: "85vh",
          background: "#0d2b1a",
          border: "1px solid rgba(74,124,89,0.4)",
          borderRadius: 16,
          display: "flex", flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#e8f5e9", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            {replyTo ? "Reply" : "New Message"}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 4, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {/* From alias */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", width: 48, flexShrink: 0 }}>From</span>
            <select value={fromAlias} onChange={e => setFrom(e.target.value)}
              style={{ flex: 1, background: "transparent", border: "none", color: "#c8e6c9", fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer" }}>
              {FROM_ALIASES.map(a => <option key={a.label} value={a.value} style={{ background: "#0d2b1a" }}>{a.label}</option>)}
            </select>
          </div>
          {/* To */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", width: 48, flexShrink: 0 }}>To</span>
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@email.com"
              style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none" }}/>
            <button onClick={() => setShowCc(!showCc)} style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              {showCc ? "−Cc" : "+Cc"}
            </button>
          </div>
          {/* Cc */}
          {showCc && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", width: 48, flexShrink: 0 }}>Cc</span>
              <input value={cc} onChange={e => setCc(e.target.value)} placeholder="cc@email.com"
                style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none" }}/>
            </div>
          )}
          {/* Subject */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", width: 48, flexShrink: 0 }}>Subject</span>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject"
              style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none" }}/>
          </div>
        </div>

        {/* Reply quote */}
        {replyTo && (
          <div style={{ margin: "0 20px", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderLeft: "2px solid rgba(74,124,89,0.5)", borderRadius: 6, fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif", maxHeight: 80, overflow: "hidden" }}>
            <strong style={{ color: "rgba(255,255,255,0.4)" }}>On {formatDate(replyTo.date)}, {parseName(replyTo.from)} wrote:</strong>
            <br/>
            {replyTo.bodyText?.slice(0, 200)}…
          </div>
        )}

        {/* Body */}
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write your message…"
          style={{
            flex: 1, resize: "none", background: "transparent", border: "none",
            color: "#e8f5e9", fontSize: 14, fontFamily: "'DM Sans',sans-serif",
            padding: "16px 20px", outline: "none", minHeight: 180, lineHeight: 1.7,
          }}
        />

        {/* Error */}
        {error && (
          <div style={{ margin: "0 20px 8px", padding: "8px 12px", background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, fontSize: 12, color: "#fca5a5", fontFamily: "'DM Sans',sans-serif" }}>
            {error}
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={handleSend} disabled={sending}
            style={{
              padding: "9px 24px", background: "#2d6a4f", border: "none", borderRadius: 8,
              color: "#fff", fontSize: 13, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 8,
              opacity: sending ? 0.7 : 1, transition: "all 0.2s",
            }}>
            {sending ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }}/> Sending…</> : <><Send size={14}/> Send</>}
          </button>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans',sans-serif" }}>
            Sending via Wikima Gmail
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Email List Item ───────────────────────────────────────────────────────────
const EmailListItem: React.FC<{
  email: EmailSummary;
  isActive: boolean;
  onClick: () => void;
}> = ({ email, isActive, onClick }) => {
  const name = parseName(email.from || email.to);
  const initials = getInitials(name);
  const color = avatarColor(name);

  return (
    <div
      onClick={onClick}
      style={{
        padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: isActive ? "rgba(45,106,79,0.25)" : email.isUnread ? "rgba(255,255,255,0.03)" : "transparent",
        borderLeft: isActive ? "3px solid #52b788" : "3px solid transparent",
        transition: "all 0.15s",
        display: "flex", gap: 12, alignItems: "flex-start",
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = email.isUnread ? "rgba(255,255,255,0.03)" : "transparent"; }}
    >
      {/* Avatar */}
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>
        {initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: email.isUnread ? 700 : 500, color: email.isUnread ? "#e8f5e9" : "rgba(255,255,255,0.7)", fontFamily: "'DM Sans',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
            {name}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>
            {formatDate(email.date)}
          </span>
        </div>
        <div style={{ fontSize: 12, fontWeight: email.isUnread ? 600 : 400, color: email.isUnread ? "#c8e6c9" : "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
          {email.subject}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {email.snippet}
        </div>
      </div>

      {/* Unread dot */}
      {email.isUnread && (
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#52b788", flexShrink: 0, marginTop: 6 }}/>
      )}
    </div>
  );
};

// ── Email Detail View ─────────────────────────────────────────────────────────
const EmailDetail: React.FC<{
  email: EmailFull;
  onBack: () => void;
  onReply: () => void;
  onStar: () => void;
  onTrash: () => void;
}> = ({ email, onBack, onReply, onStar, onTrash }) => {
  const name = parseName(email.from);
  const initials = getInitials(name);
  const color = avatarColor(name);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontFamily: "'DM Sans',sans-serif", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#52b788")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
          <ChevronLeft size={16}/> Back
        </button>
        <div style={{ flex: 1 }}/>
        <button onClick={onStar} title={email.isStarred ? "Unstar" : "Star"}
          style={{ background: "none", border: "none", color: email.isStarred ? "#f6c90e" : "rgba(255,255,255,0.3)", cursor: "pointer", padding: 6, borderRadius: 8, transition: "color 0.2s" }}>
          <Star size={16} fill={email.isStarred ? "#f6c90e" : "none"}/>
        </button>
        <button onClick={onReply}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#2d6a4f", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "background 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#40916c")} onMouseLeave={e => (e.currentTarget.style.background = "#2d6a4f")}>
          <Reply size={13}/> Reply
        </button>
        <button onClick={onTrash}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 6, borderRadius: 8, transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#f87171")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
          <Trash2 size={16}/>
        </button>
      </div>

      {/* Subject */}
      <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e8f5e9", fontFamily: "'DM Sans',sans-serif", margin: "0 0 16px 0", lineHeight: 1.3 }}>
          {email.subject}
        </h2>

        {/* Sender row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e8f5e9", fontFamily: "'DM Sans',sans-serif" }}>{name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif" }}>
              {parseEmail(email.from)} → {email.to}{email.cc ? `, ${email.cc}` : ""}
            </div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif" }}>
            {new Date(email.date).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        {email.bodyHtml ? (
          <div
            style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.8)", fontFamily: "'DM Sans',sans-serif" }}
            dangerouslySetInnerHTML={{ __html: email.bodyHtml
              .replace(/<a /g, '<a style="color:#52b788;" ')
              .replace(/background-color:\s*#[0-9a-fA-F]+/g, "background-color:transparent")
              .replace(/color:\s*black/gi, "color:#e8f5e9")
              .replace(/color:\s*#000[0-9a-fA-F]{0,3}/g, "color:#e8f5e9")
            }}
          />
        ) : (
          <pre style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.8)", fontFamily: "'DM Sans',sans-serif", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {email.bodyText || "(no content)"}
          </pre>
        )}
      </div>
    </div>
  );
};

// ── Main Emails Page ──────────────────────────────────────────────────────────
export default function EmailsPage() {
  const [folder,    setFolder]    = useState<Folder>("inbox");
  const [emails,    setEmails]    = useState<EmailSummary[]>([]);
  const [selected,  setSelected]  = useState<EmailFull | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [search,    setSearch]    = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [compose,   setCompose]   = useState(false);
  const [replyTo,   setReplyTo]   = useState<EmailFull | undefined>(undefined);
  const [nextPage,  setNextPage]  = useState<string | undefined>(undefined);
  const [error,     setError]     = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const autoRefreshRef = useRef<NodeJS.Timeout>();

  const fetchEmails = useCallback(async (pageToken?: string) => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ folder, search });
      if (pageToken) params.set("pageToken", pageToken);
      const res = await fetch(`/api/gmail/messages?${params}`);
      if (!res.ok) throw new Error((await res.json()).error || "Failed to load emails");
      const data = await res.json();
      setEmails(pageToken ? prev => [...prev, ...data.emails] : data.emails);
      setNextPage(data.nextPageToken);
      setUnreadCount(data.emails.filter((e: EmailSummary) => e.isUnread).length);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [folder, search]);

  useEffect(() => {
    setEmails([]); setSelected(null);
    fetchEmails();
  }, [folder, search]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    autoRefreshRef.current = setInterval(() => fetchEmails(), 60_000);
    return () => clearInterval(autoRefreshRef.current);
  }, [fetchEmails]);

  const openEmail = async (id: string) => {
    setLoadingMsg(true);
    try {
      const res = await fetch(`/api/gmail/messages/${id}`);
      if (!res.ok) throw new Error("Failed to load email");
      const data = await res.json();
      setSelected(data);
      setEmails(prev => prev.map(e => e.id === id ? { ...e, isUnread: false } : e));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingMsg(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/gmail/messages/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (action === "trash") { setSelected(null); fetchEmails(); }
    if (action === "star" || action === "unstar") {
      setSelected(prev => prev ? { ...prev, isStarred: action === "star" } : prev);
    }
  };

  const FOLDERS: { id: Folder; label: string; icon: React.ReactNode }[] = [
    { id: "inbox",   label: "Inbox",   icon: <Inbox size={15}/> },
    { id: "sent",    label: "Sent",    icon: <Send size={15}/> },
    { id: "starred", label: "Starred", icon: <Star size={15}/> },
    { id: "trash",   label: "Trash",   icon: <Trash2 size={15}/> },
  ];

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(82,183,136,0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(82,183,136,0.5); }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#e8f5e9", fontFamily: "'DM Sans',sans-serif", margin: 0 }}>
            Email Inbox
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", marginTop: 4 }}>
            info@wikimasafari.com · reservations@wikimasafari.com
          </p>
        </div>
        <button onClick={() => { setReplyTo(undefined); setCompose(true); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#2d6a4f", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          <Plus size={14}/> Compose
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, gap: 0, background: "rgba(0,0,0,0.2)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <div style={{ width: 220, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Folder list */}
          <div style={{ padding: "16px 12px" }}>
            {FOLDERS.map(f => (
              <button key={f.id} onClick={() => setFolder(f.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8,
                  background: folder === f.id ? "rgba(45,106,79,0.4)" : "transparent",
                  border: "none", cursor: "pointer", color: folder === f.id ? "#52b788" : "rgba(255,255,255,0.5)",
                  fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: folder === f.id ? 600 : 400,
                  marginBottom: 2, transition: "all 0.15s", textAlign: "left",
                }}>
                {f.icon}
                {f.label}
                {f.id === "inbox" && unreadCount > 0 && (
                  <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "#2d6a4f", color: "#52b788", borderRadius: 10, padding: "1px 7px" }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Alias info */}
          <div style={{ margin: "auto 12px 16px", padding: "12px", background: "rgba(45,106,79,0.15)", borderRadius: 10, border: "1px solid rgba(45,106,79,0.3)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#52b788", fontFamily: "'DM Sans',sans-serif", marginBottom: 6 }}>
              Connected Addresses
            </p>
            {["info@wikimasafari.com", "reservations@wikimasafari.com", "wikimasafari02@gmail.com"].map(addr => (
              <div key={addr} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#52b788", flexShrink: 0 }}/>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {addr}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Email List ── */}
        <div style={{ width: 340, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Search bar */}
          <div style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px" }}>
              <Search size={13} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}/>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && setSearch(searchInput)}
                placeholder="Search emails…"
                style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none" }}
              />
              {searchInput && <button onClick={() => { setSearchInput(""); setSearch(""); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0 }}><X size={13}/></button>}
            </div>
          </div>

          {/* List header */}
          <div style={{ padding: "10px 16px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif" }}>
              {emails.length} messages
            </span>
            <button onClick={() => fetchEmails()} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 4, borderRadius: 6, transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#52b788")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
              <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }}/>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ margin: "0 12px 8px", padding: "8px 12px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, fontSize: 11, color: "#fca5a5", fontFamily: "'DM Sans',sans-serif", display: "flex", gap: 6, alignItems: "flex-start" }}>
              <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 1 }}/>
              {error}
            </div>
          )}

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading && emails.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
                <Loader2 size={24} style={{ color: "#52b788", animation: "spin 1s linear infinite" }}/>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif" }}>Loading emails…</span>
              </div>
            ) : emails.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 8 }}>
                <Mail size={32} style={{ color: "rgba(255,255,255,0.1)" }}/>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif" }}>No emails found</span>
              </div>
            ) : (
              <>
                {emails.map(e => (
                  <EmailListItem key={e.id} email={e} isActive={selected?.id === e.id} onClick={() => openEmail(e.id)}/>
                ))}
                {nextPage && (
                  <div style={{ padding: "12px 16px", textAlign: "center" }}>
                    <button onClick={() => fetchEmails(nextPage)}
                      style={{ fontSize: 12, color: "#52b788", background: "none", border: "1px solid rgba(82,183,136,0.3)", borderRadius: 8, padding: "7px 20px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Detail Panel ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {loadingMsg ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
              <Loader2 size={24} style={{ color: "#52b788", animation: "spin 1s linear infinite" }}/>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif" }}>Loading…</span>
            </div>
          ) : selected ? (
            <EmailDetail
              email={selected}
              onBack={() => setSelected(null)}
              onReply={() => { setReplyTo(selected); setCompose(true); }}
              onStar={() => handleAction(selected.id, selected.isStarred ? "unstar" : "star")}
              onTrash={() => handleAction(selected.id, "trash")}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, opacity: 0.4 }}>
              <Mail size={48} style={{ color: "#52b788" }}/>
              <span style={{ fontSize: 15, color: "#e8f5e9", fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>Select an email to read</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif" }}>Emails refresh automatically every 60s</span>
            </div>
          )}
        </div>
      </div>

      {/* Compose / Reply modal */}
      {compose && (
        <ComposeModal
          replyTo={replyTo}
          onClose={() => { setCompose(false); setReplyTo(undefined); }}
          onSent={() => { setCompose(false); setReplyTo(undefined); fetchEmails(); }}
        />
      )}
    </div>
  );
}
