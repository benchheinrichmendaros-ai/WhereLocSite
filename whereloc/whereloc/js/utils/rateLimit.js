// ==========================================================================
// js/utils/rateLimit.js
// Calls the `rate-limit` Supabase Edge Function (see
// /supabase/edge-functions/rate-limit) before letting a spot upload or
// review go through. The actual per-account/IP counting happens
// server-side in the function — this file just calls it and interprets
// the response, so it can't be bypassed by editing client code.
// ==========================================================================

import { supabase } from "../supabaseClient.js";
import { RATE_LIMIT_FN_URL } from "../../config.js";

// action: "spot_upload" | "review" | "report"
// Returns { allowed: true } or { allowed: false, message } — never throws
// on a normal rate-limit rejection, only on a genuine network/server error.
export async function checkRateLimit(action) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Must be logged in.");

  const res = await fetch(RATE_LIMIT_FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action }),
  });

  if (!res.ok && res.status !== 429) {
    // Fail open on infra errors so a function outage doesn't brick the
    // whole app — but log it so it's visible in dev tools.
    console.error("Rate limit check failed:", res.status);
    return { allowed: true };
  }

  const body = await res.json();
  if (res.status === 429) {
    return {
      allowed: false,
      message: body.message || "You're doing that too often — try again in a bit.",
    };
  }
  return { allowed: true };
}
