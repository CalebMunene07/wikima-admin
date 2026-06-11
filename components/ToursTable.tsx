"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tour } from "@/lib/supabase";
import { Pencil, Trash2, Eye } from "lucide-react";

export default function ToursTable({ tours }: { tours: Tour[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tour?")) return;
    setDeleting(id);
    await fetch("/api/tours", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    router.refresh();
  };

  if (!tours.length) return (
    <div className="text-center py-20 text-stone-400 text-sm">
      No tours yet. <Link href="/dashboard/tours/new" className="text-amber-600 underline">Create one</Link>.
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            {["Title","Category","Standard","Premium","Luxury","Status","Actions"].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {tours.map(tour => (
            <tr key={tour.id} className="hover:bg-stone-50">
              <td className="px-4 py-3 font-medium text-stone-800">{tour.title ?? "—"}</td>
              <td className="px-4 py-3 text-stone-500">{tour.category ?? "—"}</td>
              <td className="px-4 py-3 text-stone-700">
                {tour.standard_price != null ? `$ ${Number(tour.standard_price).toLocaleString()}` : "—"}
              </td>
              <td className="px-4 py-3 text-stone-700">
                {tour.premium_price != null ? `$ ${Number(tour.premium_price).toLocaleString()}` : "—"}
              </td>
              <td className="px-4 py-3 text-stone-700">
                {tour.luxury_price != null ? `$ ${Number(tour.luxury_price).toLocaleString()}` : "—"}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  tour.is_active ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                }`}>
                  {tour.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link href={`/tours/${tour.id}`} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700"><Eye size={15} /></Link>
                  <Link href={`/tours/${tour.id}`} className="p-1.5 rounded-lg hover:bg-amber-50 text-stone-400 hover:text-amber-600"><Pencil size={15} /></Link>
                  <button onClick={() => handleDelete(tour.id)} disabled={deleting === tour.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 disabled:opacity-40">
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
