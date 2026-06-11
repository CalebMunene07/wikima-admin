export const runtime = 'edge';
import { getSupabaseAdmin as supabaseAdmin } from "@/lib/supabase-server";
import ToursTable from "@/components/ToursTable";
import Link from "next/link";
export const revalidate = 0;
export default async function ToursPage() {
  const { data: tours, error } = await supabaseAdmin().from("tours").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#f5f0e8" }}>Tours</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(245,240,232,0.5)" }}>{tours?.length ?? 0} tours total</p>
        </div>
        <Link href="/dashboard/tours/new"
          className="px-4 py-2 font-semibold text-sm rounded-lg transition-colors"
          style={{ background: "linear-gradient(135deg, #D4AF37, #a07830)", color: "#07301d" }}>
          + New Tour
        </Link>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{error.message}</div>}
      <ToursTable tours={tours ?? []} />
    </div>
  );
}
