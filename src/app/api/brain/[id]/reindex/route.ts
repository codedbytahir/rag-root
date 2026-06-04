import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase-server';
import { verifyBrainOwnership } from '@/lib/db/queries/brains';
import { processIngestion } from '@/lib/rag/ingestion';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

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

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete existing vectors
    const { error: deleteError } = await supabaseAdmin
      .from('document_sections')
      .delete()
      .filter('metadata->>brain_id', 'eq', brain_id);

    if (deleteError) {
      logger.error({ error: deleteError.message }, 'Reindex delete error');
      throw new Error('Failed to clear existing vectors');
    }

    // Fetch all files
    const { data: brainFiles, error: fetchError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('brain_id', brain_id);

    if (fetchError) throw fetchError;
    if (!brainFiles || brainFiles.length === 0) {
      return NextResponse.json({ success: true, message: 'No files to reindex.' });
    }

    // Re-ingest each file
    const results = [];
    for (const file of brainFiles) {
      try {
        await processIngestion({
          file_id: file.id,
          file_name: file.file_name,
          file_path: file.storage_path,
          brain_id,
          user_id: session.user.id,
          brain,
        });
        results.push({ file: file.file_name, status: 'success' });
      } catch (err) {
        results.push({ file: file.file_name, status: 'error', error: (err as Error).message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Re-indexing complete. Processed ${brainFiles.length} files.`,
      results,
    });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error({ error: (error as Error).message }, 'Reindex error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
