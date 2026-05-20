import TourForm from "@/components/TourForm";
export default function NewTourPage() {
  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-stone-800">Create Custom Tour</h1><p className="text-stone-400 text-sm mt-0.5">Add a new tour to the Wikima catalog</p></div>
      <TourForm />
    </div>
  );
}
