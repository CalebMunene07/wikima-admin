export const runtime = 'edge';
import { supabaseAdmin } from "@/lib/supabase-server";
import TourForm from "@/components/TourForm";
import { notFound } from "next/navigation";
type Props = { params: Promise<{ id: string }> };
export default async function EditTourPage({ params }: Props) {
  const { id } = await params;
  const { data: tour, error } = await supabaseAdmin.from("tours").select("*").eq("id", id).single();
  if (error || !tour) notFound();
  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-stone-800">Edit Tour</h1><p className="text-stone-400 text-sm mt-0.5">{tour.title}</p></div>
      <TourForm tour={tour} />
    </div>
  );
}
