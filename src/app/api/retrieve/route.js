import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decrypt } from "@/app/utils/encryption";

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

  // Fetch full brain settings for model info and keys
  const { data: brain } = await supabase
    .from('brains')
    .select('*')
    .eq('id', brain_id)
    .single();

  if (!brain) return NextResponse.json({ error: "Access Denied" }, { status: 403 });

  try {
    // 1. DYNAMIC IMPORTS
    const { 
      SupabaseVectorStore, 
      VectorStoreIndex, 
      Settings
    } = await import("llamaindex");
    const { GeminiEmbedding } = await import("@llamaindex/google");

    // 2. DETERMINE GOOGLE KEY & MODEL
    let googleKey = process.env.GOOGLE_API_KEY;
    if (brain.use_global_keys) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('global_google_api_key')
            .eq('id', user.id)
            .single();
        if (profile?.global_google_api_key) googleKey = decrypt(profile.global_google_api_key);
    } else if (brain.google_api_key) {
        googleKey = decrypt(brain.google_api_key);
    }

    const embeddingModel = brain.embedding_model || "text-embedding-005";

    // 3. CONFIGURE GOOGLE EMBEDDINGS
    const embedModel = new GeminiEmbedding({
      apiKey: googleKey,
      model: embeddingModel,
    });

    Settings.embedModel = embedModel;

    // 4. CONNECT TO YOUR SUPABASE STORE
    const vectorStore = new SupabaseVectorStore({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      tableName: "document_sections",
      queryName: "match_documents",
    });

    // 5. INITIALIZE INDEX FROM EXISTING DATA
    const index = await VectorStoreIndex.fromVectorStore(vectorStore, {
        embedModel: embedModel
    });

    // 6. THE RETRIEVER
    const retriever = index.asRetriever({ 
        similarityTopK: 3,
        preFilters: { brain_id: brain_id } 
    });

    // 7. EXECUTE RETRIEVAL
    const results = await retriever.retrieve(query);

    // 8. FORMAT RESULTS FOR UI
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