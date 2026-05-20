import { supabaseAdmin } from "@/lib/supabase-server";
import BookingsTable from "@/components/BookingsTable";
export const revalidate = 0;
export default async function BookingsPage() {
  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  const pending = bookings?.filter(b => b.status === "pending").length ?? 0;
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#f5f0e8" }}>Bookings</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(245,240,232,0.5)" }}>
          {bookings?.length ?? 0} total
          {pending > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
              {pending} pending
            </span>
          )}
        </p>
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
          {error.message}
        </div>
      )}
      <BookingsTable bookings={bookings ?? []} />
    </div>
  );
}
