type Color = "amber" | "emerald" | "blue" | "red" | "stone";
const colorMap: Record<Color, string> = { amber: "bg-amber-50 border-amber-200 text-amber-700", emerald: "bg-emerald-50 border-emerald-200 text-emerald-700", blue: "bg-blue-50 border-blue-200 text-blue-700", red: "bg-red-50 border-red-200 text-red-700", stone: "bg-stone-50 border-stone-200 text-stone-700" };
const numColor: Record<Color, string> = { amber: "text-amber-600", emerald: "text-emerald-600", blue: "text-blue-600", red: "text-red-600", stone: "text-stone-600" };
type Props = { label: string; value: number | string; color?: Color; sublabel?: string };
export default function StatsCard({ label, value, color = "stone", sublabel }: Props) {
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${numColor[color]}`}>{value}</p>
      {sublabel && <p className="text-xs mt-1 opacity-60">{sublabel}</p>}
    </div>
  );
}
