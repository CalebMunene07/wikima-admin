import { createClient } from "@supabase/supabase-js";

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default getSupabase;
export { getSupabase as supabase };

export type TourHistory = {
  id: string;
  tour_id: string;
  action: "created" | "updated" | "deleted" | "confirmed";
  changed_by: string;
  snapshot: Record<string, unknown>;
  created_at: string;
};
