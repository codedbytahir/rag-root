import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase-server';
import { verifyBrainOwnership } from '@/lib/db/queries/brains';
import { performRetrieval } from '@/lib/rag/retriever';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const retrieveSchema = z.object({
  brain_id: z.string().uuid(),
  query: z.string().min(1).max(2000),
  top_k: z.number().int().min(1).max(20).optional().default(5),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const parsed = retrieveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { brain_id, query, top_k } = parsed.data;

    // Verify ownership
    const brain = await verifyBrainOwnership(brain_id, session.user.id);
    if (!brain) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    // Perform retrieval
    const results = await performRetrieval({ query, brain_id, top_k, brain });

    return NextResponse.json({ results });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Retrieve API error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
