import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bsxzqjalhrhbwsqrqoao.supabase.co";

export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeHpxamFsaHJoYndzcXJxb2FvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg1NDE4OSwiZXhwIjoyMDkxNDMwMTg5fQ.X1w9V1dVK0036brM55d9KKIA4XKg7daLBhqDVu2WwPI";
  return createClient(SUPABASE_URL, serviceRoleKey, {
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
