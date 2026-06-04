import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase-server';
import { processIngestion } from '@/lib/rag/ingestion';
import { verifyBrainOwnership } from '@/lib/db/queries/brains';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const runtime = 'nodejs';

const ingestSchema = z.object({
  file_id: z.string().uuid(),
  file_path: z.string().min(1),
  brain_id: z.string().uuid(),
  file_name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const parsed = ingestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { file_id, file_path, brain_id, file_name } = parsed.data;

    // Verify brain ownership
    const brain = await verifyBrainOwnership(brain_id, session.user.id);
    if (!brain) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    const result = await processIngestion({
      file_id,
      file_path,
      brain_id,
      file_name,
      user_id: session.user.id,
      brain,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Ingest API error');
    return NextResponse.json({ error: 'Ingest failed' }, { status: 500 });
  }
}
