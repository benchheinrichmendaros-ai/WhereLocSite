// ==========================================================================
// config.js
// The ONLY file with environment-specific values. Replace the two
// placeholders below with your Supabase project's values (Project
// Settings -> API in the Supabase dashboard). The anon/public key is
// safe to ship in client code IF your Row Level Security policies are
// set up correctly (see /supabase/rls_policies.sql) — it cannot bypass RLS.
//
// Do not commit your real keys to a public repo if you'd rather keep them
// private; GitHub Pages has no server, so this file ships to the browser
// either way. RLS is what actually protects your data, not secrecy of
// this key.
// ==========================================================================

export const SUPABASE_URL = "https://taypbinxekgqdprxuxrf.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRheXBiaW54ZWtncWRwcnh1eHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjAyNTAsImV4cCI6MjA5NzQzNjI1MH0.X-BayvMAJoDdeHAooPaphYgx0lpDfAy5qBGgxBfeiZI";

// Name of the Supabase Storage bucket used for spot photos + avatars
export const STORAGE_BUCKET = "whereloc-media";

// URL of the deployed rate-limit Edge Function (see /supabase/edge-functions).
// Format: https://YOUR-PROJECT-REF.supabase.co/functions/v1/rate-limit
export const RATE_LIMIT_FN_URL = `${SUPABASE_URL}/functions/v1/rate-limit`;

// App-wide constants — change these in one place instead of hunting
// through every page that references a category or limit.
export const CATEGORIES = [
  { value: "study", label: "Study" },
  { value: "date", label: "Date" },
  { value: "relax", label: "Relax" },
  { value: "other", label: "Other" },
];

export const AGE_TAGS = [
  { value: "all", label: "All ages" },
  { value: "18+", label: "18+" },
  { value: "21+", label: "21+" },
];

export const MAX_IMAGES_PER_SPOT = 5;
export const MAX_IMAGE_SIZE_MB = 8;
