import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function logHistory(
  tourId: string,
  action: "created" | "updated" | "deleted" | "confirmed",
  snapshot: Record<string, unknown>,
  changedBy = "admin"
) {
  const { error } = await getSupabaseAdmin().from("tour_history").insert({
    tour_id: tourId, action, snapshot, changed_by: changedBy,
  });
  if (error) console.error("History log error:", error);
}
