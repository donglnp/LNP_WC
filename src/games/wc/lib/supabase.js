import { createClient } from "@supabase/supabase-js";

const url =
  import.meta.env.VITE_WC_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL;
const key =
  import.meta.env.VITE_WC_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;
export const isSupabaseReady = Boolean(url && key);
