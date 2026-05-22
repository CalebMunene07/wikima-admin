import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
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

export { getSupabaseAdmin as supabaseAdmin };
