import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase-server';
import { getBrainWithFiles, deleteBrain, updateBrain } from '@/lib/db/queries/brains';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const brain = await getBrainWithFiles(id, session.user.id);
    if (!brain) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    return NextResponse.json({ brain, files: brain.files || [] });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Get brain error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    await deleteBrain(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Delete brain error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
