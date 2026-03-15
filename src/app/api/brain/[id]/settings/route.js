import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { encrypt } from "@/app/utils/encryption";

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const { id: brain_id } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
        chat_model,
        embedding_model,
        groq_api_key,
        google_api_key,
        use_global_keys
    } = await request.json();

    // Only encrypt if they are provided and not already "placeholder" (or similar logic)
    // For simplicity, we assume if they are provided, they are new keys.
    const updateData = {
        chat_model,
        embedding_model,
        use_global_keys
    };

    if (groq_api_key && !groq_api_key.includes(':')) {
        updateData.groq_api_key = encrypt(groq_api_key);
    }
    if (google_api_key && !google_api_key.includes(':')) {
        updateData.google_api_key = encrypt(google_api_key);
    }

    const { error } = await supabase
      .from('brains')
      .update(updateData)
      .eq('id', brain_id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Brain Settings API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
