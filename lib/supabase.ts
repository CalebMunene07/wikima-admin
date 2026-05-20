import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tour = {
  id: string;
  title: string;
  slug?: string;
  category?: string;
  tags?: string[];
  long_description?: string;
  image_url?: string;
  standard_price?: number;
  premium_price?: number;
  luxury_price?: number;
  is_active: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  tour_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  num_participants: number;
  booking_date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total_price: number;
  notes?: string;
  created_at: string;
};

export type TourHistory = {
  id: string;
  tour_id: string;
  action: "created" | "updated" | "deleted" | "confirmed";
  changed_by: string;
  snapshot: Record<string, unknown>;
  created_at: string;
};
