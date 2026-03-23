import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateApiKey } from "../../utils/api-key";

const getSupabase = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );
};

export async function GET() {
  const supabase = await getSupabase();
  const { data: key, error } = await supabase
    .from('api_keys')
    .select('id, key_hint, created_at, last_used_at')
    .single(); // Use .single() because there is only one

  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(key || null);
}

export async function POST() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rawKey, hashedKey, hint } = generateApiKey();

  // "UPSERT" logic: Delete old key if it exists, then insert new one
  await supabase.from('api_keys').delete().eq('user_id', user.id);

  const { error } = await supabase.from('api_keys').insert({
    user_id: user.id,
    name: 'Primary API Key',
    key_hint: hint,
    hashed_key: hashedKey
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ apiKey: rawKey });
}