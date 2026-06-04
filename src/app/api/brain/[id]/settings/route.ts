import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase-server';
import { updateBrain, verifyBrainOwnership } from '@/lib/db/queries/brains';
import { encrypt } from '@/lib/encryption';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const settingsSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  chat_model: z.string().optional(),
  chat_provider: z.string().optional(),
  embedding_model: z.string().optional(),
  embedding_provider: z.string().optional(),
  groq_api_key: z.string().optional(),
  google_api_key: z.string().optional(),
  use_global_keys: z.boolean().optional(),
  system_prompt: z.string().optional(),
  no_context_prompt: z.string().optional(),
  citation_format: z.string().optional(),
  max_context_chunks: z.number().int().min(1).max(20).optional(),
  chunking_strategy: z.enum(['auto', 'fixed', 'sentence', 'paragraph']).optional(),
  chunk_size: z.number().int().min(128).max(4096).optional(),
  chunk_overlap: z.number().int().min(0).max(2048).optional(),
  retrieval_mode: z.enum(['semantic', 'keyword', 'hybrid']).optional(),
  reranking_enabled: z.boolean().optional(),
  reranking_model: z.string().optional(),
});

export async function POST(
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

    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(parsed.data)) {
      if (value === undefined) continue;

      // Encrypt API keys before storing
      if ((key === 'groq_api_key' || key === 'google_api_key') && typeof value === 'string') {
        if (value && !value.includes(':')) {
          updateData[key] = encrypt(value);
        }
      } else {
        updateData[key] = value;
      }
    }

    await updateBrain(brain_id, session.user.id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Brain settings error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
