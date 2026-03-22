import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { processIngestion } from "@/app/utils/ingest-service";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    // 1. Auth Check
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Parse Body Safely
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { file_id, file_path, brain_id, file_name } = body;

    // 3. Validate Required Fields
    if (!file_id || !file_path || !brain_id || !file_name) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missing: {
            file_id: !file_id,
            file_path: !file_path,
            brain_id: !brain_id,
            file_name: !file_name,
          },
        },
        { status: 400 }
      );
    }

    // 4. Delegate to Service
    const result = await processIngestion({
      file_id,
      file_path,
      brain_id,
      file_name,
      user_id: user.id,
    });

    return NextResponse.json(result);

  } catch (err) {
    console.error("[Ingest API Error]", err);
    return NextResponse.json(
      { error: err?.message || "Ingest failed" },
      { status: 500 }
    );
  }
}