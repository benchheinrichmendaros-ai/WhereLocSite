// ==========================================================================
// js/supabaseClient.js
// Creates one Supabase client and exports it. Every other file imports
// `supabase` from here instead of creating its own client.
// ==========================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
