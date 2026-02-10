/**
 * Performs the RAG Query using the specific working logic
 */
export async function performRAG({ query, brain_id, stream = true }) {
  // 1. DYNAMIC IMPORTS
  const { GeminiEmbedding } = await import("@llamaindex/google");
  const { Groq } = await import("@llamaindex/groq");
  const { SupabaseVectorStore } = await import("@llamaindex/supabase");
  const { VectorStoreIndex, Settings } = await import("llamaindex");

  // 2. Configure Settings
  Settings.embedModel = new GeminiEmbedding({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "text-embedding-004",
  });

  Settings.llm = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama3-8b-8192",
  });

  // 3. Connect to Vector Store
  const vectorStore = new SupabaseVectorStore({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    table: "document_sections",
  });

  const index = await VectorStoreIndex.fromVectorStore(vectorStore);

  // 4. Setup Query Engine with Brain Filtering
  const queryEngine = index.asQueryEngine({
    preFilters: { brain_id: brain_id } // Ensures AI only reads this brain's data
  });

  // 5. Execute
  return await queryEngine.query({
    query: query,
    stream: stream,
  });
}