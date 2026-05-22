export const runtime = 'edge';
import { getSupabaseAdmin as supabaseAdmin } from "@/lib/supabase-server";
import StatsCard from "@/components/StatsCard";
export const revalidate = 0;
export default async function AnalyticsPage() {
  const [{ count: totalTours }, { count: activeTours }, { count: totalBookings }, { count: pendingBookings }, { count: confirmedBookings }] = await Promise.all([
    supabaseAdmin.from("tours").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("tours").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
  ]);
  const { data: revenueData } = await supabaseAdmin.from("bookings").select("total_amount").eq("status", "confirmed");
  const totalRevenue = revenueData?.reduce((sum, b) => sum + (b.total_amount ?? 0), 0) ?? 0;
  const { data: recentBookings } = await supabaseAdmin.from("bookings")
    .select("id, guest_name, reference, status, total_amount, travel_date, tour_title, package")
    .order("created_at", { ascending: false }).limit(5);
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#f5f0e8" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.5)" }}>Wikima Safari Expeditions — Staff Overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatsCard label="Total Tours"    value={totalTours ?? 0}       color="stone" />
        <StatsCard label="Active Tours"   value={activeTours ?? 0}      color="emerald" />
        <StatsCard label="Total Bookings" value={totalBookings ?? 0}    color="blue" />
        <StatsCard label="Pending"        value={pendingBookings ?? 0}  color="amber" sublabel="Awaiting confirmation" />
        <StatsCard label="Confirmed"      value={confirmedBookings ?? 0} color="emerald" />
        <StatsCard label="Revenue"        value={`$${totalRevenue.toLocaleString()}`} color="amber" />
      </div>
      <div>
        <h2 className="text-base font-semibold mb-3" style={{ color: "#D4AF37" }}>Recent Bookings</h2>
        {!recentBookings?.length ? (
          <p className="text-sm" style={{ color: "rgba(245,240,232,0.5)" }}>No bookings yet.</p>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(212,175,55,0.2)", background: "rgba(4,31,19,0.6)" }}>
            <table className="min-w-full text-sm">
              <thead style={{ borderBottom: "1px solid rgba(212,175,55,0.15)", background: "rgba(2,15,9,0.5)" }}>
                <tr>{["Guest","Tour","Package","Status","Amount","Travel Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#D4AF37" }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {recentBookings.map((b: any) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "#f5f0e8" }}>{b.guest_name ?? "—"}</td>
                    <td className="px-4 py-3" style={{ color: "rgba(245,240,232,0.6)" }}>{b.tour_title ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs capitalize"
                        style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37" }}>
                        {b.package ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        b.status === "confirmed" ? "bg-emerald-100 text-emerald-700"
                        : b.status === "pending" ? "bg-amber-100 text-amber-700"
                        : "bg-stone-100 text-stone-500"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#D4AF37" }}>
                      {b.total_amount != null ? `$${Number(b.total_amount).toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "rgba(245,240,232,0.5)" }}>
                      {b.travel_date ? new Date(b.travel_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
