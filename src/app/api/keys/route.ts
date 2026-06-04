import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase-server';
import { generateApiKey, hashApiKey } from '@/lib/api-key';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await requireAuth();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: key, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, key_hint, created_at, last_used_at')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(key || null);
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Get API keys error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await requireAuth();

    const { rawKey, hashedKey, hint } = generateApiKey();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete old key if exists, then insert new one
    await supabaseAdmin.from('api_keys').delete().eq('user_id', session.user.id);

    const { error } = await supabaseAdmin.from('api_keys').insert({
      user_id: session.user.id,
      name: 'Primary API Key',
      key_hint: hint,
      hashed_key: hashedKey,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ apiKey: rawKey });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Create API key error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
