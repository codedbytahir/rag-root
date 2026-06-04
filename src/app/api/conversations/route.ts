import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase-server';
import { listConversations, createConversation } from '@/lib/db/queries/conversations';
import { verifyBrainOwnership } from '@/lib/db/queries/brains';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const createSchema = z.object({
  brain_id: z.string().uuid(),
  title: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const brainId = searchParams.get('brain_id');

    if (!brainId) {
      return NextResponse.json({ error: 'brain_id is required' }, { status: 400 });
    }

    // Verify ownership
    const brain = await verifyBrainOwnership(brainId, session.user.id);
    if (!brain) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    const conversations = await listConversations(brainId, session.user.id);
    return NextResponse.json({ conversations });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'List conversations error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { brain_id, title } = parsed.data;

    // Verify ownership
    const brain = await verifyBrainOwnership(brain_id, session.user.id);
    if (!brain) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    const conversation = await createConversation(brain_id, session.user.id, title);
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Create conversation error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
