import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  // 1. Await params (Next.js 15 requirement)
  const { id } = await params;
  
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  console.log(`[API] Fetching brain ${id}...`);

  // 2. Fetch Brain
  const { data: brain, error: brainError } = await supabase
    .from('brains')
    .select('*')
    .eq('id', id)
    .single();

  if (brainError) {
    console.error("[API] Brain fetch error:", brainError.message);
    return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
  }

  // 3. Fetch Files (Explicitly selecting columns helps performance)
  const { data: files, error: filesError } = await supabase
    .from('files')
    .select('id, file_name, file_size, storage_path, created_at')
    .eq('brain_id', id)
    .order('created_at', { ascending: false });

  if (filesError) {
    console.error("[API] Files fetch error:", filesError.message);
    // Don't crash the page, just return empty files
    return NextResponse.json({ brain, files: [] });
  }

  console.log(`[API] Found ${files.length} files.`);
  return NextResponse.json({ brain, files });
}