import { createClient } from "@supabase/supabase-js";

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default getSupabase;
export { getSupabase as supabase };



export type Tour = {
  id: string;
  title: string;
  slug: string;
  category: string;
  long_description: string;
  image_url: string;
  standard_price: number;
  premium_price: number;
  luxury_price: number;
  is_active: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type TourHistory = {
  id: string;
  tour_id: string;
  action: "created" | "updated" | "deleted" | "confirmed";
  changed_by: string;
  snapshot: Record<string, unknown>;
  created_at: string;
};
