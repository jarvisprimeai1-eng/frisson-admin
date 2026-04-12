import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "https://klcunkatwofjeasioolm.supabase.co";
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_7i6XtISW8Lr0t5v7hpbKPw_fFQVWae3";

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
