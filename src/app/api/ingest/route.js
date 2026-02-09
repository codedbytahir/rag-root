import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import os from "os";

// LlamaIndex core
import {
  VectorStoreIndex,
  storageContextFromDefaults,
  Settings,
  Document
} from "llamaindex";

// Google + Readers + Supabase
import { GeminiEmbedding } from "@llamaindex/google";
import { PDFReader } from "@llamaindex/readers/pdf";
import { SupabaseVectorStore } from "@llamaindex/supabase";

export const runtime = "nodejs";

/* ------------------------------ HANDLER ------------------------------- */
export async function POST(request) {
  // 0. Validate Environment Variables
  if (!process.env.GOOGLE_API_KEY) {
    return NextResponse.json({ error: "Missing GOOGLE_API_KEY environment variable" }, { status: 500 });
  }

  const googleGenAIEmbedModel = new GeminiEmbedding({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "text-embedding-004",
  });

  Settings.embedModel = googleGenAIEmbedModel;
  Settings.llm = null;

  // 1. Validate Environment Variables for Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Missing Supabase Environment Variables" }, { status: 500 });
  }

  const { file_id, file_path, brain_id } = await request.json();
  const tmpFilePath = path.join(os.tmpdir(), `${file_id}.pdf`);

  // 2. Initialize Supabase Client
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
      metadata: { ...doc.metadata, file_id, brain_id }
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