"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function BookingsTable({ bookings }: { bookings: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setLoading(id);
    await fetch("/api/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setLoading(null);
    router.refresh();
  };

  if (!bookings.length) return (
    <div className="text-center py-20 text-sm" style={{ color: "rgba(245,240,232,0.4)" }}>
      No bookings yet.
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(212,175,55,0.2)", background: "rgba(4,31,19,0.6)" }}>
      <table className="min-w-full text-sm">
        <thead style={{ borderBottom: "1px solid rgba(212,175,55,0.15)", background: "rgba(2,15,9,0.5)" }}>
          <tr>
            {["Ref","Guest","Tour","Package","Visitor","Referred By","Travel Date","Guests","Total","Deposit","Status","Actions"].map(h => (
              <th key={h} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ color: "#D4AF37" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b: any) => (
            <tr key={b.id} style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
              <td className="px-3 py-3 font-mono text-xs" style={{ color: "rgba(245,240,232,0.5)" }}>
                {b.reference ?? "—"}
              </td>
              <td className="px-3 py-3">
                <p className="font-medium whitespace-nowrap" style={{ color: "#f5f0e8" }}>{b.guest_name ?? "—"}</p>
              </td>
              <td className="px-3 py-3" style={{ color: "rgba(245,240,232,0.7)" }}>
                {b.tour_title ?? "—"}
              </td>
              <td className="px-3 py-3">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                  style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37" }}>
                  {b.package ?? "—"}
                </span>
              </td>
              <td className="px-3 py-3">
                {b.visitor_type ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap"
                    style={{
                      background: b.visitor_type === "resident" ? "rgba(59,130,246,0.15)" : "rgba(168,85,247,0.15)",
                      color: b.visitor_type === "resident" ? "#60a5fa" : "#c084fc",
                    }}>
                    {b.visitor_type === "resident" ? "🇰🇪 Resident" : "🌍 Non-Resident"}
                  </span>
                ) : (
                  <span style={{ color: "rgba(245,240,232,0.3)" }}>—</span>
                )}
              </td>
              <td className="px-3 py-3">
                {b.referred_by ? (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md whitespace-nowrap"
                    style={{ background: "rgba(212,175,55,0.1)", color: "#D4AF37" }}>
                    via {b.referred_by}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: "rgba(245,240,232,0.3)" }}>Direct</span>
                )}
              </td>
              <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ color: "rgba(245,240,232,0.6)" }}>
                {b.travel_date ? new Date(b.travel_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </td>
              <td className="px-3 py-3 text-center" style={{ color: "rgba(245,240,232,0.6)" }}>
                {b.guests ?? ((b.adults ?? 0) + (b.children ?? 0))}
                {b.adults != null && <span className="text-xs block" style={{ color: "rgba(245,240,232,0.3)" }}>{b.adults}A {b.children ?? 0}C</span>}
              </td>
              <td className="px-3 py-3 font-medium" style={{ color: "#D4AF37" }}>
                {b.total_amount != null ? `$${Number(b.total_amount).toLocaleString()}` : "—"}
              </td>
              <td className="px-3 py-3" style={{ color: "rgba(245,240,232,0.6)" }}>
                {b.deposit_amount != null ? `$${Number(b.deposit_amount).toLocaleString()}` : "—"}
              </td>
              <td className="px-3 py-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  b.status === "confirmed" ? "bg-emerald-100 text-emerald-700"
                  : b.status === "pending" ? "bg-amber-100 text-amber-700"
                  : b.status === "cancelled" ? "bg-red-100 text-red-600"
                  : b.status === "completed" ? "bg-blue-100 text-blue-700"
                  : "bg-stone-100 text-stone-500"
                }`}>
                  {b.status === "confirmed" ? <CheckCircle size={11} />
                    : b.status === "pending" ? <Clock size={11} />
                    : <XCircle size={11} />}
                  {b.status ?? "—"}
                </span>
              </td>
              <td className="px-3 py-3">
                {b.status === "pending" && (
                  <div className="flex gap-1.5">
                    <button disabled={loading === b.id} onClick={() => updateStatus(b.id, "confirmed")}
                      className="px-2.5 py-1 text-xs rounded-lg disabled:opacity-50 font-medium"
                      style={{ background: "#16a34a", color: "white" }}>
                      Confirm
                    </button>
                    <button disabled={loading === b.id} onClick={() => updateStatus(b.id, "cancelled")}
                      className="px-2.5 py-1 text-xs rounded-lg disabled:opacity-50 font-medium"
                      style={{ background: "#dc2626", color: "white" }}>
                      Cancel
                    </button>
                  </div>
                )}
                {b.status === "confirmed" && (
                  <button disabled={loading === b.id} onClick={() => updateStatus(b.id, "completed")}
                    className="px-2.5 py-1 text-xs rounded-lg disabled:opacity-50 font-medium"
                    style={{ background: "#2563eb", color: "white" }}>
                    Complete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
