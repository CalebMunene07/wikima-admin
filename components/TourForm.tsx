"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tour } from "@/lib/supabase";

type TourInput = {
  title: string;
  slug: string;
  category: string;
  long_description: string;
  image_url: string;
  standard_price: number;
  premium_price: number;
  luxury_price: number;
  is_active: boolean;
  tags: string;
};

const defaultForm: TourInput = {
  title: "", slug: "", category: "", long_description: "",
  image_url: "", standard_price: 0, premium_price: 0,
  luxury_price: 0, is_active: false, tags: "",
};

export default function TourForm({ tour }: { tour?: Tour }) {
  const router = useRouter();
  const isEdit = !!tour;
  const [form, setForm] = useState<TourInput>(tour ? {
    title: tour.title ?? "",
    slug: tour.slug ?? "",
    category: tour.category ?? "",
    long_description: tour.long_description ?? "",
    image_url: tour.image_url ?? "",
    standard_price: tour.standard_price ?? 0,
    premium_price: tour.premium_price ?? 0,
    luxury_price: tour.luxury_price ?? 0,
    is_active: tour.is_active ?? false,
    tags: tour.tags?.join(", ") ?? "",
  } : defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof TourInput, value: string | number | boolean) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.title) { setError("Title is required."); return; }
    setLoading(true); setError(null);
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [],
    };
    const res = await fetch("/api/tours", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { id: tour!.id, ...payload } : payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error?.message ?? "Something went wrong."); return; }
    router.push("/dashboard/tours"); router.refresh();
  };

  return (
    <div className="max-w-2xl space-y-5">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
      <div className="grid grid-cols-2 gap-4">

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Tour Title *</label>
          <input value={form.title} onChange={e => set("title", e.target.value)}
            placeholder="e.g. Masai Mara Migration Safari"
            className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Slug</label>
          <input value={form.slug} onChange={e => set("slug", e.target.value)}
            placeholder="e.g. masai-mara-migration"
            className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Category</label>
          <select value={form.category} onChange={e => set("category", e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">Select category</option>
            <option value="safari">Safari</option>
            <option value="beach">Beach</option>
            <option value="mountain">Mountain</option>
            <option value="cultural">Cultural</option>
            <option value="honeymoon">Honeymoon</option>
            <option value="family">Family</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Standard Price (KES)</label>
          <input type="number" value={form.standard_price} onChange={e => set("standard_price", Number(e.target.value))}
            className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Premium Price (KES)</label>
          <input type="number" value={form.premium_price} onChange={e => set("premium_price", Number(e.target.value))}
            className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Luxury Price (KES)</label>
          <input type="number" value={form.luxury_price} onChange={e => set("luxury_price", Number(e.target.value))}
            className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Status</label>
          <select value={form.is_active ? "true" : "false"} onChange={e => set("is_active", e.target.value === "true")}
            className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="false">Inactive</option>
            <option value="true">Active</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Tags (comma separated)</label>
          <input value={form.tags} onChange={e => set("tags", e.target.value)}
            placeholder="e.g. wildlife, big five, kenya"
            className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Image URL</label>
          <input value={form.image_url} onChange={e => set("image_url", e.target.value)}
            placeholder="https://..."
            className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Description</label>
          <textarea value={form.long_description} onChange={e => set("long_description", e.target.value)}
            rows={5} placeholder="Describe the tour experience..."
            className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y" />
        </div>

      </div>
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSubmit} disabled={loading}
          className="px-6 py-2.5 bg-amber-500 text-stone-900 font-semibold text-sm rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-colors">
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Tour"}
        </button>
        <button onClick={() => router.back()}
          className="px-6 py-2.5 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-stone-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
