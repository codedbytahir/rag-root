import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase-server';
import { updateGlobalApiKeys } from '@/lib/db/queries/users';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const profileKeysSchema = z.object({
  global_groq_api_key: z.string().optional(),
  global_google_api_key: z.string().optional(),
  openai_api_key_encrypted: z.string().optional(),
  anthropic_api_key_encrypted: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = profileKeysSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await updateGlobalApiKeys(session.user.id, parsed.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Profile keys error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
