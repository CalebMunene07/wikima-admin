export const runtime = 'edge';
import { getSupabaseAdmin as supabaseAdmin } from "@/lib/supabase-server";
import HistoryTable from "@/components/HistoryTable";
export const revalidate = 0;
export default async function HistoryPage() {
  const { data: history, error } = await supabaseAdmin.from("tour_history").select("*").order("created_at", { ascending: false }).limit(200);
  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-stone-800">History</h1><p className="text-stone-400 text-sm mt-0.5">Audit log — {history?.length ?? 0} entries</p></div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">Failed to load: {error.message}</div>}
      <HistoryTable history={history ?? []} />
    </div>
  );
}
