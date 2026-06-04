import { createClient } from '@supabase/supabase-js';
import { RATE_LIMIT_MAX_REQUESTS } from '@/config/constants';
import { logger } from '@/lib/logger';

/**
 * Check if a user has exceeded their rate limit.
 * Uses the Supabase RPC function `check_rate_limit`.
 * Falls back to allowing the request if the check fails.
 */
export async function checkRateLimit(userId: string): Promise<boolean> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      target_user_id: userId,
    });

    if (error) {
      logger.error({ error: error.message, userId }, 'Rate limit check error');
      return true; // Allow if RPC fails to avoid blocking users
    }

    return data as boolean;
  } catch (err) {
    logger.error({ err, userId }, 'Rate limit check exception');
    return true; // Allow on error
  }
}
