
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bsxzqjalhrhbwsqrqoao.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeHpxamFsaHJoYndzcXJxb2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTQxODksImV4cCI6MjA5MTQzMDE4OX0.7TW-wqRrBrIfzgEcVmhQ1LEDcVbDM11CnI0X1EBMtw4";

const getSupabase = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

