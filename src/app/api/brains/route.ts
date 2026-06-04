import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase-server';
import { listBrains, createBrain } from '@/lib/db/queries/brains';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await requireAuth();
    const brains = await listBrains(session.user.id);
    return NextResponse.json(brains);
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'List brains error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const createBrainSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  chat_model: z.string().optional(),
  chat_provider: z.string().optional(),
  embedding_model: z.string().optional(),
  embedding_provider: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = createBrainSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const brain = await createBrain({
      ...parsed.data,
      user_id: session.user.id,
    });

    return NextResponse.json(brain, { status: 201 });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Create brain error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
