export const runtime = 'edge';
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const revalidate = 0;

export default async function AnalyticsPage() {
  const supabase = getSupabaseAdmin();

  const [{ data: tours }, { data: bookings }] = await Promise.all([
    supabase.from("tours").select("id, title, category, standard_price, is_active"),
    supabase.from("bookings").select("id, status, tour_id, created_at"),
  ]);

  // Stats
  const totalTours = tours?.length ?? 0;
  const activeTours = tours?.filter(t => t.is_active).length ?? 0;
  const totalBookings = bookings?.length ?? 0;
  const confirmedBookings = bookings?.filter(b => b.status === "confirmed").length ?? 0;
  const pendingBookings = bookings?.filter(b => b.status === "pending").length ?? 0;

  // Bookings by category
  const categoryMap: Record<string, number> = {};
  bookings?.forEach(b => {
    const tour = tours?.find(t => t.id === b.tour_id);
    if (tour?.category) {
      categoryMap[tour.category] = (categoryMap[tour.category] ?? 0) + 1;
    }
  });

  // Bookings by month (last 6 months)
  const monthMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    monthMap[key] = 0;
  }
  bookings?.forEach(b => {
    const d = new Date(b.created_at);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (key in monthMap) monthMap[key]++;
  });

  // Top 5 tours by bookings
  const tourBookingCount: Record<string, number> = {};
  bookings?.forEach(b => {
    if (b.tour_id) tourBookingCount[b.tour_id] = (tourBookingCount[b.tour_id] ?? 0) + 1;
  });
  const topTours = Object.entries(tourBookingCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      name: tours?.find(t => t.id === id)?.title ?? "Unknown",
      count,
    }));

  const maxMonth = Math.max(...Object.values(monthMap), 1);
  const maxCategory = Math.max(...Object.values(categoryMap), 1);
  const maxTour = Math.max(...topTours.map(t => t.count), 1);

  const categoryColors: Record<string, string> = {
    safari: "#D4AF37",
    beach: "#38bdf8",
    mountain: "#86efac",
    cultural: "#f9a8d4",
    honeymoon: "#fb923c",
    family: "#a78bfa",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#f5f0e8" }}>Analytics</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(245,240,232,0.5)" }}>Overview of tours and bookings</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Tours", value: totalTours, color: "#D4AF37" },
          { label: "Active Tours", value: activeTours, color: "#86efac" },
          { label: "Total Bookings", value: totalBookings, color: "#38bdf8" },
          { label: "Confirmed", value: confirmedBookings, color: "#4ade80" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(245,240,232,0.5)" }}>{label}</p>
            <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Bookings per Month */}
        <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#f5f0e8" }}>Bookings — Last 6 Months</h2>
          <div className="flex items-end gap-2 h-36">
            {Object.entries(monthMap).map(([month, count]) => (
              <div key={month} className="flex flex-col items-center flex-1 gap-1">
                <span className="text-xs font-bold" style={{ color: "#D4AF37" }}>{count}</span>
                <div className="w-full rounded-t" style={{
                  height: `${(count / maxMonth) * 100}px`,
                  minHeight: count > 0 ? "4px" : "2px",
                  background: count > 0 ? "linear-gradient(180deg, #D4AF37, #a07830)" : "rgba(255,255,255,0.1)"
                }} />
                <span className="text-xs" style={{ color: "rgba(245,240,232,0.4)" }}>{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings by Category */}
        <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#f5f0e8" }}>Bookings by Category</h2>
          {Object.keys(categoryMap).length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(245,240,232,0.4)" }}>No booking data yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize font-medium" style={{ color: "#f5f0e8" }}>{cat}</span>
                    <span style={{ color: "rgba(245,240,232,0.5)" }}>{count}</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div className="h-2 rounded-full" style={{
                      width: `${(count / maxCategory) * 100}%`,
                      background: categoryColors[cat] ?? "#D4AF37"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Tours */}
        <div className="rounded-xl p-5 md:col-span-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#f5f0e8" }}>Top 5 Tours by Bookings</h2>
          {topTours.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(245,240,232,0.4)" }}>No booking data yet.</p>
          ) : (
            <div className="space-y-3">
              {topTours.map(({ name, count }, i) => (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: "#f5f0e8" }}>{i + 1}. {name}</span>
                    <span style={{ color: "rgba(245,240,232,0.5)" }}>{count} bookings</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div className="h-2 rounded-full" style={{
                      width: `${(count / maxTour) * 100}%`,
                      background: `hsl(${40 + i * 30}, 80%, 55%)`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Status */}
        <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#f5f0e8" }}>Booking Status</h2>
          <div className="space-y-3">
            {[
              { label: "Confirmed", count: confirmedBookings, color: "#4ade80" },
              { label: "Pending", count: pendingBookings, color: "#D4AF37" },
              { label: "Other", count: totalBookings - confirmedBookings - pendingBookings, color: "#94a3b8" },
            ].map(({ label, count, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: "#f5f0e8" }}>{label}</span>
                  <span style={{ color: "rgba(245,240,232,0.5)" }}>{count}</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div className="h-2 rounded-full" style={{
                    width: totalBookings > 0 ? `${(count / totalBookings) * 100}%` : "0%",
                    background: color
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
