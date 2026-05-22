import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bsxzqjalhrhbwsqrqoao.supabase.co";

export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }

  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { 
      autoRefreshToken: false, 
      persistSession: false 
    },
  });
}

export async function logHistory(
  tourId: string,
  action: "created" | "updated" | "deleted" | "confirmed",
  snapshot: Record<string, unknown>,
  changedBy = "admin"
) {
  const { error } = await getSupabaseAdmin().from("tour_history").insert({
    tour_id: tourId, 
    action, 
    snapshot, 
    changed_by: changedBy,
  });
  if (error) console.error("History log error:", error);
}
