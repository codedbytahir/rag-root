import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import os from "os";

export const runtime = "nodejs";

/* ------------------------------ HANDLER ------------------------------- */
export async function POST(request) {
  // 0. Auth Check
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 0.5 Validate Environment Variables
  if (!process.env.GOOGLE_API_KEY) {
    return NextResponse.json({ error: "Missing GOOGLE_API_KEY environment variable" }, { status: 500 });
  }

  // 1. DYNAMIC IMPORTS
  const { GeminiEmbedding } = await import("@llamaindex/google");
  const { PDFReader } = await import("@llamaindex/readers/pdf");
  const { SupabaseVectorStore } = await import("@llamaindex/supabase");
  const {
    VectorStoreIndex,
    storageContextFromDefaults,
    Settings,
    Document
  } = await import("llamaindex");

  const googleGenAIEmbedModel = new GeminiEmbedding({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "text-embedding-004",
  });

  Settings.embedModel = googleGenAIEmbedModel;
  Settings.llm = null;

  // 2. Validate Environment Variables for Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Missing Supabase Environment Variables" }, { status: 500 });
  }

  const { file_id, file_path, brain_id, file_name } = await request.json();

  // Verify Brain Ownership
  const { data: brain } = await supabaseAuth
    .from('brains')
    .select('id')
    .eq('id', brain_id)
    .single();

  if (!brain) return NextResponse.json({ error: "Access Denied: Brain not found" }, { status: 403 });

  const tmpFilePath = path.join(os.tmpdir(), `${file_id}.pdf`);

  // 3. Initialize Supabase Admin Client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log(`[Ingest] Downloading PDF: ${file_path}`);

    /* -------------------------- DOWNLOAD PDF -------------------------- */
    const { data: fileData, error } = await supabase.storage
      .from("docs")
      .download(file_path);

    if (error || !fileData) {
      throw new Error(`Supabase Storage download failed: ${error?.message}`);
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    await fs.writeFile(tmpFilePath, buffer);

    /* --------------------------- READ PDF ----------------------------- */
    const reader = new PDFReader();
    const rawDocs = await reader.loadData(tmpFilePath);

    if (!rawDocs || rawDocs.length === 0) {
      throw new Error("PDF parsing produced zero text content");
    }

    const docs = rawDocs.map(doc => new Document({
      text: doc.text,
      metadata: { ...doc.metadata, file_id, brain_id, file_name }
    }));

    /* ----------------------- VECTOR STORE ----------------------------- */
    const vectorStore = new SupabaseVectorStore({
      client: supabase,
      table: "document_sections",
    });

    const storageContext = await storageContextFromDefaults({
      vectorStore
    });

    /* ------------------------- INDEX DOCS ----------------------------- */
    console.log("[Ingest] Indexing documents...");

    await VectorStoreIndex.fromDocuments(docs, {
      storageContext,
      embedModel: googleGenAIEmbedModel,
    });

    /* ------------------------ UPDATE STATUS --------------------------- */
    await supabase
      .from("files")
      .update({ status: "ready" })
      .eq("id", file_id);

    console.log(`[Ingest] SUCCESS: File ${file_id} indexed.`);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Ingest Error]", err);
    return NextResponse.json(
      { error: err?.message || "Ingest failed" },
      { status: 500 }
    );
  } finally {
    try {
      if (await fs.stat(tmpFilePath)) await fs.unlink(tmpFilePath);
    } catch (_) { }
  }
}