// ==========================================================================
// supabase/edge-functions/rate-limit/index.ts
// Deploy with: supabase functions deploy rate-limit
// Runs server-side on Supabase's infrastructure (Deno), so this is the
// real enforcement point — it uses the service-role key, writes to a
// table the browser client can never touch, and can't be bypassed by
// editing client-side JS.
//
// Request:  POST { action: "spot_upload" | "review" | "report" }
//           Authorization: Bearer <user's access token>
// Response: 200 { allowed: true }
//           429 { allowed: false, message: string }
// ==========================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// action -> [max attempts, window in minutes]. Edit these to retune
// limits without touching any other code.
const LIMITS: Record<string, [number, number]> = {
  spot_upload: [5, 60],   // 5 spots per hour per account/IP
  review: [10, 60],       // 10 reviews per hour
  report: [10, 60 * 24],  // 10 reports per day
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// GitHub Pages (and your local dev server) call this from a different
// origin than the function itself, so every response needs CORS headers
// and OPTIONS preflight requests need an explicit reply.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ allowed: false, message: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return json({ allowed: false, message: "Not authenticated" }, 401);
  }

  const { action } = await req.json().catch(() => ({}));
  const limitConfig = LIMITS[action];
  if (!limitConfig) {
    return json({ allowed: false, message: "Unknown action" }, 400);
  }
  const [maxAttempts, windowMinutes] = limitConfig;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const windowStart = new Date(Date.now() - windowMinutes * 60_000).toISOString();

  const [byUser, byIp] = await Promise.all([
    supabaseAdmin
      .from("rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("action", action)
      .gte("created_at", windowStart),
    supabaseAdmin
      .from("rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .eq("action", action)
      .gte("created_at", windowStart),
  ]);

  const userCount = byUser.count ?? 0;
  const ipCount = byIp.count ?? 0;

  if (userCount >= maxAttempts || ipCount >= maxAttempts) {
    return json({
      allowed: false,
      message: `You've hit the limit for this action — try again in under ${windowMinutes} minutes.`,
    }, 429);
  }

  await supabaseAdmin.from("rate_limits").insert({ user_id: user.id, ip, action });

  return json({ allowed: true }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}
