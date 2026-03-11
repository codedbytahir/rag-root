import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { query, brain_id } = await request.json();

  // Verify ownership
  const { data: brain } = await supabase
    .from('brains')
    .select('id')
    .eq('id', brain_id)
    .single();

  if (!brain) return NextResponse.json({ error: "Access Denied" }, { status: 403 });

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
      model: "text-embedding-005", // Google's latest
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