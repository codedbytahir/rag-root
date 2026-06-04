import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

interface UsageLogParams {
  userId: string;
  brainId?: string;
  conversationId?: string;
  status: 'success' | 'error';
  tokens?: number;
  model?: string;
  type: 'chat' | 'ingest' | 'retrieve' | 'v1_query';
  error?: string;
  latencyMs?: number;
  ipAddress?: string;
}

/**
 * Log an AI request to the database for analytics and rate limiting.
 * Uses service role to bypass RLS.
 */
export async function logUsage(params: UsageLogParams): Promise<void> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: insertError } = await supabaseAdmin
      .from('request_logs')
      .insert({
        user_id: params.userId,
        brain_id: params.brainId || null,
        conversation_id: params.conversationId || null,
        status: params.status,
        tokens_used: params.tokens || 0,
        model_used: params.model || null,
        type: params.type,
        error_message: params.error || null,
        latency_ms: params.latencyMs || null,
        ip_address: params.ipAddress || null,
      });

    if (insertError) {
      logger.error({ error: insertError.message }, 'Failed to log usage');
    }
  } catch (err) {
    logger.error({ err }, 'Unexpected error logging usage');
  }
}
