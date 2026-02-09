import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { query, brain_id } = await request.json();
  const cookieStore = await cookies();

  try {
    // 1. DYNAMIC IMPORTS
    const { 
      SupabaseVectorStore, 
      VectorStoreIndex, 
      Settings, 
      GeminiEmbedding // Using Google's Embedding class
    } = await import("llamaindex");

    // 2. CONFIGURE GOOGLE EMBEDDINGS
    Settings.embedModel = new GeminiEmbedding({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "text-embedding-004", // Google's latest
    });

    // 3. CONNECT TO YOUR SUPABASE STORE
    const vectorStore = new SupabaseVectorStore({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      tableName: "document_sections",
      queryName: "match_documents",
    });

    // 4. INITIALIZE INDEX FROM EXISTING DATA
    const index = await VectorStoreIndex.fromVectorStore(vectorStore);

    // 5. THE RETRIEVER (Using the logic you provided)
    const retriever = index.asRetriever({ 
        similarityTopK: 3,
        // Ensure we only retrieve from this specific brain
        preFilters: { brain_id: brain_id } 
    });

    // 6. EXECUTE RETRIEVAL
    const results = await retriever.retrieve(query);

    // 7. FORMAT RESULTS FOR UI
    // Extract text and metadata (like page numbers)
    const formattedResults = results.map(node => ({
      text: node.node.getContent(),
      metadata: node.node.metadata,
      score: node.score
    }));

    return NextResponse.json({ results: formattedResults });

  } catch (error) {
    console.error("[Retrieval Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}