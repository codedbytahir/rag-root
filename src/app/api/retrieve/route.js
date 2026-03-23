import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { processIngestion } from "../../utils/ingest-service";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    /* --------------------------- AUTH -------------------------------- */
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll() { return cookieStore.getAll(); } } }
    );

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    /* ------------------------- PARSE BODY --------------------------- */
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { file_id, file_path, brain_id, file_name } = body;

    /* ------------------------- VALIDATE ----------------------------- */
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

    /* ------------------------- INGEST ------------------------------- */
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