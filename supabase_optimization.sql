-- ======================================================================================
-- RAG ROOT: AWESOME VECTOR SEARCH OPTIMIZATION ALGORITHM
-- Objective: Achieve sub-100ms retrieval speeds at scale using HNSW and GIN indexing.
-- ======================================================================================

-- 1. ENABLE EXTENSIONS
-- Ensure pgvector is enabled for vector operations.
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. HNSW INDEXING (The "Awesome Algorithm" for Approximate Nearest Neighbors)
-- HNSW (Hierarchical Navigable Small World) is significantly faster than IVFFlat.
-- We use vector_cosine_ops because RAG typically uses Cosine Similarity.
-- m: Max connections per node. Higher = more accurate but larger index.
-- ef_construction: Accuracy/Build time tradeoff. 64-128 is optimal for text-embedding-004.
DROP INDEX IF EXISTS document_sections_embedding_hnsw_idx;
CREATE INDEX document_sections_embedding_hnsw_idx
ON public.document_sections
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 3. METADATA GIN INDEXING
-- Since we filter by brain_id inside the JSONB metadata, a GIN index is essential.
-- This prevents a sequential scan of the metadata column.
CREATE INDEX IF NOT EXISTS document_sections_metadata_gin_idx
ON public.document_sections USING gin (metadata);

-- 4. TARGETED BTREE INDEX FOR BRAIN_ID
-- For even faster exact matches on brain_id, we can extract it into a functional index.
CREATE INDEX IF NOT EXISTS document_sections_brain_id_idx
ON public.document_sections ((metadata->>'brain_id'));

-- 5. OPTIMIZED match_documents FUNCTION
-- This version is designed to work perfectly with the HNSW index.
-- It enforces filtering BEFORE the vector search to maximize performance.
-- NOTE: We drop it first to avoid "cannot change return type" errors if the signature changed.
DROP FUNCTION IF EXISTS public.match_documents(vector, int, jsonb);

CREATE OR REPLACE FUNCTION public.match_documents (
  query_embedding vector(768),
  match_count int DEFAULT 5,
  filter jsonb DEFAULT '{}'
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    document_sections.id,
    document_sections.content,
    document_sections.metadata,
    1 - (document_sections.embedding <=> query_embedding) AS similarity
  FROM public.document_sections
  WHERE
    -- Apply metadata filter first (using the GIN/BTree index)
    (document_sections.metadata @> filter OR filter = '{}')
  ORDER BY
    -- Use the HNSW index for the distance calculation
    document_sections.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. STATISTICS REFRESH
-- ANALYZE helps the query planner understand the new indexes.
ANALYZE public.document_sections;
