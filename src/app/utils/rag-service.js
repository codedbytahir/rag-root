import { decrypt } from "./encryption";

/**
 * Performs the RAG Query using dynamic settings and brain-specific models/keys.
 */
export async function performRAG({ query, brain_id, stream = true, brain: passedBrain, profile: passedProfile }) {
  // 1. DYNAMIC IMPORTS
  const { GeminiEmbedding } = await import("@llamaindex/google");
  const { Groq } = await import("@llamaindex/groq");
  const { SupabaseVectorStore } = await import("@llamaindex/supabase");
  const { VectorStoreIndex, Settings } = await import("llamaindex");

  let brain = passedBrain;
  let profile = passedProfile;

  // 2. FETCH BRAIN SETTINGS IF NOT PASSED (Fallback for internal calls)
  if (!brain) {
    const { createServerClient } = await import("@supabase/ssr");
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    const { data: b, error } = await supabase
      .from('brains')
      .select('*')
      .eq('id', brain_id)
      .single();

    if (error || !b) throw new Error("Brain not found or access denied");
    brain = b;

    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', brain.user_id)
      .single();
    profile = p;
  }

  // 3. DETERMINE KEYS & MODELS
  let groqKey = process.env.GROQ_API_KEY;
  let googleKey = process.env.GOOGLE_API_KEY;

  if (brain.use_global_keys && profile) {
    if (profile.global_groq_api_key) groqKey = decrypt(profile.global_groq_api_key);
    if (profile.global_google_api_key) googleKey = decrypt(profile.global_google_api_key);
  } else {
    if (brain.groq_api_key) groqKey = decrypt(brain.groq_api_key);
    if (brain.google_api_key) googleKey = decrypt(brain.google_api_key);
  }

  const chatModel = brain.chat_model || "llama3-8b-8192";
  const embeddingModel = brain.embedding_model || "text-embedding-005";

  // 4. CONFIGURE LLAMAINDEX
  const embedModel = new GeminiEmbedding({
    apiKey: googleKey,
    model: embeddingModel,
  });

  const llm = new Groq({
    apiKey: groqKey,
    model: chatModel,
  });

  // Explicitly set in Settings as well for general compatibility
  Settings.embedModel = embedModel;
  Settings.llm = llm;

  // 5. CONNECT TO VECTOR STORE
  const vectorStore = new SupabaseVectorStore({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY, // Uses Service Role to ensure access
    tableName: "document_sections",
    queryName: "match_documents",
  });

  // 6. INITIALIZE INDEX
  const index = await VectorStoreIndex.fromVectorStore(vectorStore, {
    embedModel: embedModel
  });

  // 7. SETUP QUERY ENGINE
  const queryEngine = index.asQueryEngine({
    llm: llm,
    preFilters: { brain_id: brain_id }
  });

  // 8. EXECUTE
  return await queryEngine.query({
    query: query,
    stream: stream,
  });
}
