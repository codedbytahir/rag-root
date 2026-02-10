import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  );
};

export async function POST(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // 1. Verify User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth Failed:", authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Prepare Data object
    const fileData = {
      file_name: body.name,
      file_size: body.size,
      file_type: body.type,
      storage_path: body.file_path, // Must match DB column 'storage_path'
      brain_id: body.brain_id,
      user_id: user.id
    };

    console.log("Inserting into DB:", fileData);

    // 3. Insert
    const { data, error } = await supabase
      .from('files')
      .insert([fileData])
      .select();

    if (error) {
      console.error("Supabase DB Error:", error.message, error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Return success
    // Even if data is empty (RLS issue), we return success to debug
    const newFile = data ? data[0] : null;
    return NextResponse.json(newFile || { success: true, warning: "Row inserted but not returned" });

  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, path } = await request.json();

  // Ensure user owns the file before deleting
  const { data: file, error: fetchError } = await supabase
    .from('files')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !file) {
    return NextResponse.json({ error: 'File not found or access denied' }, { status: 403 });
  }

  await supabase.storage.from('docs').remove([path]);
  const { error } = await supabase.from('files').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}