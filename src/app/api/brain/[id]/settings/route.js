import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { encrypt } from "../../../../utils/encryption";

export const dynamic = 'force-dynamic';

/**
 * PATCH: Partial updates for brain configuration (LLM, System Prompt)
 */
export async function PATCH(request, { params }) {
  try {
    const { id: brain_id } = await params;
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { chat_model, system_prompt } = body;

    const { data, error } = await supabase
      .from('brains')
      .update({
          chat_model,
          system_prompt,
          updated_at: new Date().toISOString()
      })
      .eq('id', brain_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Brain Settings PATCH Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Full settings update (including keys)
 */
export async function POST(request, { params }) {
  try {
    const { id: brain_id } = await params;
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
        chat_model,
        embedding_model,
        groq_api_key,
        google_api_key,
        use_global_keys,
        system_prompt
    } = await request.json();

    const updateData = {
        chat_model,
        embedding_model,
        use_global_keys,
        system_prompt
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
    console.error("[Brain Settings POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
