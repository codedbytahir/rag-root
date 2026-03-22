import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { processIngestion } from "@/app/utils/ingest-service";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    /* --------------------------- AUTH -------------------------------- */
    const { id: brain_id } = await params;
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll() { return cookieStore.getAll(); } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    /* ------------------------- VALIDATE ----------------------------- */
    if (!brain_id) {
      return NextResponse.json({ error: "Brain ID is required" }, { status: 400 });
    }

    /* ---------------------- VERIFY OWNERSHIP ------------------------ */
    const { data: brain } = await supabase
      .from("brains")
      .select("id")
      .eq("id", brain_id)
      .eq("user_id", user.id)
      .single();

    if (!brain) return NextResponse.json({ error: "Access Denied" }, { status: 403 });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    /* ------------------- DELETE EXISTING VECTORS -------------------- */
    const { error: deleteError } = await supabaseAdmin
      .from("document_sections")
      .delete()
      .filter("metadata->>brain_id", "eq", brain_id);

    if (deleteError) {
      console.error("[Reindex] Delete Error:", deleteError);
      throw new Error("Failed to clear existing vectors");
    }

    /* --------------------- FETCH ALL FILES -------------------------- */
    const { data: files, error: fetchError } = await supabaseAdmin
      .from("files")
      .select("*")
      .eq("brain_id", brain_id);

    if (fetchError) throw fetchError;
    if (!files || files.length === 0) {
      return NextResponse.json({ success: true, message: "No files to reindex.", results: [] });
    }

    /* -------------------- RE-INGEST EACH FILE ----------------------- */
    const results = [];
    for (const file of files) {
      try {
        await processIngestion({
          file_id: file.id,
          file_name: file.file_name,
          file_path: file.storage_path,
          brain_id,
          user_id: user.id,
        });
        results.push({ file: file.file_name, status: "success" });
      } catch (err) {
        console.error(`[Reindex] Failed for ${file.file_name}:`, err.message);
        results.push({ file: file.file_name, status: "error", error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Re-indexing complete. Processed ${files.length} files.`,
      results,
    });

  } catch (error) {
    console.error("[Reindex API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}