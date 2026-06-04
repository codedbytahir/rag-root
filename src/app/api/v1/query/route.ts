import { NextRequest, NextResponse } from 'next/server';
import { verifyBrainOwnership, resolveBrainApiKeys } from '@/lib/db/queries/brains';
import { performRAG } from '@/lib/rag/pipeline';
import { hashApiKey } from '@/lib/api-key';
import { checkRateLimit } from '@/lib/rate-limit';
import { logUsage } from '@/lib/usage';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const querySchema = z.object({
  query: z.string().min(1).max(2000),
  brain_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Validate Bearer token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawKey = authHeader.split(' ')[1];
    const hashedKey = hashApiKey(rawKey);

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Validate key owner
    const { data: keyData } = await supabaseAdmin
      .from('api_keys')
      .select('user_id')
      .eq('hashed_key', hashedKey)
      .single();

    if (!keyData) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
    }

    // 3. Rate limit check
    const isAllowed = await checkRateLimit(keyData.user_id);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // 4. Parse and validate request body
    const body = await request.json();
    const parsed = querySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { query, brain_id } = parsed.data;

    // 5. Verify brain ownership
    const brain = await verifyBrainOwnership(brain_id, keyData.user_id);
    if (!brain) {
      return NextResponse.json({ error: 'Access Denied: Brain not found' }, { status: 403 });
    }

    // 6. Resolve API keys for embedding
    const apiKeys = await resolveBrainApiKeys(brain, keyData.user_id);

    // 7. Perform RAG
    const result = await performRAG({
      query,
      brain_id,
      brain,
      apiKey: brain.embedding_provider === 'google' ? apiKeys.googleKey : apiKeys.openaiKey,
    });

    // 8. Log usage
    await logUsage({
      userId: keyData.user_id,
      brainId: brain_id,
      status: 'success',
      model: brain.chat_model || 'unknown',
      type: 'v1_query',
      tokens: Math.ceil(result.context.length / 4),
      latencyMs: Date.now() - startTime,
    });

    // 9. Return structured response
    return NextResponse.json({
      answer: result.context,
      sources: result.sources,
      brain_id,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'V1 query API error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
