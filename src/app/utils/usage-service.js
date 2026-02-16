import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Checks if a user has exceeded their rate limit (10 req/hour).
 */
export async function checkRateLimit(userId) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data, error } = await supabase.rpc('check_rate_limit', { target_user_id: userId });

  if (error) {
    console.error("[UsageService] Rate limit check error:", error.message);
    return true; // Allow if RPC fails to avoid blocking users
  }

  return data;
}

/**
 * Logs an AI request to the database.
 */
export async function logUsage({ userId, brainId, status, tokens, model, type, error }) {
  // Use Service Role to bypass RLS and ensure logs are written
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { error: insertError } = await supabaseAdmin
      .from('request_logs')
      .insert({
        user_id: userId,
        brain_id: brainId,
        status: status || 'success',
        tokens_used: tokens || 0,
        model_used: model,
        error_message: error || null,
        type: type || 'chat'
      });

    if (insertError) {
      console.error("[UsageService] Failed to log usage:", insertError.message);
    }
  } catch (err) {
    console.error("[UsageService] Unexpected error logging usage:", err.message);
  }
}
