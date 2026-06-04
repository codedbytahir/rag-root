import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase-server';
import { createFile, deleteFile } from '@/lib/db/queries/documents';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(500),
  file_path: z.string().min(1),
  size: z.number().optional(),
  type: z.string().optional(),
  brain_id: z.string().uuid(),
});

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

    const file = await createFile({
      file_name: parsed.data.name,
      file_size: parsed.data.size || null,
      file_type: parsed.data.type || null,
      storage_path: parsed.data.file_path,
      brain_id: parsed.data.brain_id,
      user_id: session.user.id,
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Create document error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const deleteSchema = z.object({
  id: z.string().uuid(),
  path: z.string().min(1),
});

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Delete file record and associated vectors
    const file = await deleteFile(parsed.data.id, session.user.id);
    if (!file) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 403 });
    }

    // Also remove from Supabase Storage
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabaseAdmin.storage.from('docs').remove([parsed.data.path]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Delete document error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
