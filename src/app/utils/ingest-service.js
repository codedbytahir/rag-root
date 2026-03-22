import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { decrypt } from "./encryption";

// ✅ Static imports — prevents dual-load warning
import { VectorStoreIndex, storageContextFromDefaults, Settings, Document } from "llamaindex";
import { GeminiEmbedding } from "@llamaindex/google";
import { PDFReader } from "@llamaindex/readers/pdf";
import { SupabaseVectorStore } from "@llamaindex/supabase";

export async function processIngestion({ file_id, file_path, brain_id, file_name, user_id }) {

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase Environment Variables");
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  /* -------------------- FETCH BRAIN & PROFILE ----------------------- */
  const { data: brain, error: brainError } = await supabaseAdmin
    .from("brains")
    .select("*")
    .eq("id", brain_id)
    .single();

  if (!brain || brainError) throw new Error("Brain not found");

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user_id)
    .single();

  /* -------------------- RESOLVE GOOGLE API KEY ---------------------- */
  let googleKey = process.env.GOOGLE_API_KEY;

  if (brain.use_global_keys && profile?.global_google_api_key) {
    googleKey = decrypt(profile.global_google_api_key);
  } else if (brain.google_api_key) {
    googleKey = decrypt(brain.google_api_key);
  }

  if (!googleKey) throw new Error("Google API Key not found for embeddings");

  /* -------------------- EMBEDDING MODEL ----------------------------- */
  // ✅ Locked to text-embedding-004 (768 dims) — must match your pgvector column
  const googleGenAIEmbedModel = new GeminiEmbedding({
    apiKey: googleKey,
    model: "gemini-embedding-2-preview",
    // dimensions: 1536,
  });

  Settings.embedModel = googleGenAIEmbedModel;
  Settings.llm = null;

  const tmpFilePath = path.join(os.tmpdir(), `${file_id}_${Date.now()}.pdf`);

  try {
    console.log(`[IngestService] Processing: ${file_name}`);

    /* ------------------------ DOWNLOAD PDF -------------------------- */
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("docs")
      .download(file_path);

    if (downloadError || !fileData) {
      throw new Error(`Supabase Storage download failed: ${downloadError?.message}`);
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    await fs.writeFile(tmpFilePath, buffer);

    /* ------------------------- READ PDF ----------------------------- */
    const reader = new PDFReader();
    const rawDocs = await reader.loadData(tmpFilePath);

    if (!rawDocs || rawDocs.length === 0) {
      throw new Error("PDF parsing produced zero text content");
    }

    const docs = rawDocs.map(doc => new Document({
      text: doc.text,
      metadata: { ...doc.metadata, file_id, brain_id, file_name }
    }));

    /* ---------------------- VECTOR STORE ---------------------------- */
    // ✅ Exact same constructor as working original
    const vectorStore = new SupabaseVectorStore({
      client: supabaseAdmin,
      table: "document_sections",       // ✅ "table" not "tableName"
      schema: "public",
      queryName: "match_documents",
      embeddingColumnName: "embedding",
    });

    const storageContext = await storageContextFromDefaults({ vectorStore });

    /* ----------------------- INDEX DOCS ----------------------------- */
    console.log("[IngestService] Indexing documents...");

    await VectorStoreIndex.fromDocuments(docs, {
      storageContext,
      embedModel: googleGenAIEmbedModel,
    });

    /* --------------------- UPDATE FILE STATUS ----------------------- */
    await supabaseAdmin
      .from("files")
      .update({ status: "ready" })
      .eq("id", file_id);

    console.log(`[IngestService] SUCCESS: ${file_name} indexed.`);
    return { success: true };

  } catch (err) {
    console.error("[IngestService Error]", err);

    // Mark file as failed
    await supabaseAdmin
      .from("files")
      .update({ status: "error" })
      .eq("id", file_id);

    throw err;
  } finally {
    try {
      await fs.unlink(tmpFilePath);
    } catch (_) {}
  }
}