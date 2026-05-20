import { TourHistory } from "@/lib/supabase";
const actionStyles: Record<TourHistory["action"], string> = { created: "bg-emerald-100 text-emerald-700", updated: "bg-blue-100 text-blue-700", deleted: "bg-red-100 text-red-600", confirmed: "bg-amber-100 text-amber-700" };
export default function HistoryTable({ history }: { history: TourHistory[] }) {
  if (!history.length) return <div className="text-center py-20 text-stone-400 text-sm">No history yet.</div>;
  return (
    <div className="space-y-3">
      {history.map(item => (
        <div key={item.id} className="flex gap-4 bg-white border border-stone-200 rounded-xl px-5 py-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide h-fit ${actionStyles[item.action]}`}>{item.action}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-stone-700">Tour: <span className="font-mono text-xs text-stone-400">{item.tour_id}</span></p>
              <p className="text-xs text-stone-400">{new Date(item.created_at).toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <p className="text-xs text-stone-500">By: <span className="font-medium">{item.changed_by}</span></p>
            <details className="mt-2"><summary className="text-xs text-stone-400 cursor-pointer hover:text-stone-600">View snapshot</summary>
              <pre className="mt-2 text-xs bg-stone-50 rounded-lg p-3 overflow-auto text-stone-600 border border-stone-100 max-h-48">{JSON.stringify(item.snapshot, null, 2)}</pre>
            </details>
          </div>
        </div>
      ))}
    </div>
  );
}
