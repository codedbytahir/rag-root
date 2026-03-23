import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { encrypt } from "../../../utils/encryption";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { global_groq_api_key, global_google_api_key } = await request.json();

    const updateData = {
        id: user.id,
        updated_at: new Date().toISOString()
    };

    if (global_groq_api_key && !global_groq_api_key.includes(':')) {
        updateData.global_groq_api_key = encrypt(global_groq_api_key);
    }
    if (global_google_api_key && !global_google_api_key.includes(':')) {
        updateData.global_google_api_key = encrypt(global_google_api_key);
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(updateData);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Profile Keys API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
