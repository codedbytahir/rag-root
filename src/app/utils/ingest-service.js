import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { decrypt } from "./encryption";

/**
 * Core ingestion logic shared between the direct upload API and re-indexing.
 */
export async function processIngestion({ file_id, file_path, brain_id, file_name, user_id }) {
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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase Environment Variables");
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 2. FETCH BRAIN & PROFILE
  const { data: brain } = await supabaseAdmin
    .from('brains')
    .select('*')
    .eq('id', brain_id)
    .single();

  if (!brain) throw new Error("Brain not found");

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single();

  // 3. DETERMINE EMBEDDING MODEL & KEY
  let googleKey = process.env.GOOGLE_API_KEY;
  if (brain.use_global_keys && profile?.global_google_api_key) {
    googleKey = decrypt(profile.global_google_api_key);
  } else if (brain.google_api_key) {
    googleKey = decrypt(brain.google_api_key);
  }

  if (!googleKey) throw new Error("Google API Key not found for embeddings");

  const embeddingModel = brain.embedding_model || "gemini-embedding-001";

  const googleGenAIEmbedModel = new GeminiEmbedding({
    apiKey: googleKey,
    model: embeddingModel,
  });

  Settings.embedModel = googleGenAIEmbedModel;
  Settings.llm = null;

  const tmpFilePath = path.join(os.tmpdir(), `${file_id}_${Date.now()}.pdf`);

  try {
    console.log(`[IngestService] Processing: ${file_name}`);

    /* -------------------------- DOWNLOAD PDF -------------------------- */
    const { data: fileData, error } = await supabaseAdmin.storage
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
      client: supabaseAdmin,
      tableName: "document_sections",
      queryName: "match_documents",
    });

    const storageContext = await storageContextFromDefaults({
      vectorStore
    });

    /* ------------------------- INDEX DOCS ----------------------------- */
    await VectorStoreIndex.fromDocuments(docs, {
      storageContext,
      embedModel: googleGenAIEmbedModel,
    });

    /* ------------------------ UPDATE STATUS --------------------------- */
    await supabaseAdmin
      .from("files")
      .update({ status: "ready" })
      .eq("id", file_id);

    return { success: true };

  } catch (err) {
    console.error("[IngestService Error]", err);
    throw err;
  } finally {
    try {
      if (await fs.stat(tmpFilePath)) await fs.unlink(tmpFilePath);
    } catch (_) { }
  }
}
