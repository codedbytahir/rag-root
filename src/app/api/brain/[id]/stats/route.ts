import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase-server';
import { verifyBrainOwnership } from '@/lib/db/queries/brains';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: brain_id } = await params;

    const brain = await verifyBrainOwnership(brain_id, session.user.id);
    if (!brain) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [requestLogs, tokenData, recentLogs] = await Promise.all([
      supabaseAdmin
        .from('request_logs')
        .select('status', { count: 'exact', head: true })
        .eq('brain_id', brain_id),
      supabaseAdmin
        .from('request_logs')
        .select('tokens_used')
        .eq('brain_id', brain_id),
      supabaseAdmin
        .from('request_logs')
        .select('*')
        .eq('brain_id', brain_id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    const totalRequests = requestLogs.count || 0;
    const totalTokens = tokenData.data?.reduce((acc, curr) => acc + (curr.tokens_used || 0), 0) || 0;

    return NextResponse.json({
      totalRequests,
      totalTokens,
      recentLogs: recentLogs.data || [],
    });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Brain stats error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
