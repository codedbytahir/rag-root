import { GeminiEmbedding } from "@llamaindex/google";
import { Groq } from "@llamaindex/groq";
import { SupabaseVectorStore } from "@llamaindex/supabase";
import { VectorStoreIndex, Settings } from "llamaindex";

/**
 * Performs the RAG Query using the specific working logic
 */
export async function performRAG({ query, brain_id, stream = true }) {
  // 1. Configure Settings
  Settings.embedModel = new GeminiEmbedding({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "text-embedding-004",
  });

  Settings.llm = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama3-8b-8192",
  });

  // 2. Connect to Vector Store
  const vectorStore = new SupabaseVectorStore({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    table: "document_sections",
  });

  const index = await VectorStoreIndex.fromVectorStore(vectorStore);

  // 3. Setup Query Engine with Brain Filtering
  const queryEngine = index.asQueryEngine({
    preFilters: { brain_id: brain_id } // Ensures AI only reads this brain's data
  });

  // 4. Execute
  return await queryEngine.query({
    query: query,
    stream: stream,
  });
}