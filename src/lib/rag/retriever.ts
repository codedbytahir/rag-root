import { createClient } from '@supabase/supabase-js';
import { embedQuery, clearEmbeddingCache } from './embedder';
import type { RetrievalChunk, RetrievalResult } from './types';
import type { Brain } from '@/lib/db/schema';
import { RRF_K, DEFAULT_TOP_K } from '@/config/constants';
import { logger, createLogger } from '@/lib/logger';

/**
 * Perform document retrieval based on the brain's configured mode.
 * Supports: semantic, keyword, and hybrid (with RRF).
 */
export async function performRetrieval(params: {
  query: string;
  brain_id: string;
  brain: Brain;
  top_k?: number;
  apiKey?: string;
}): Promise<RetrievalResult> {
  const { query, brain_id, brain, top_k = DEFAULT_TOP_K, apiKey } = params;
  const log = createLogger({ brainId: brain_id, mode: brain.retrieval_mode });
  const startTime = Date.now();

  try {
    const mode = brain.retrieval_mode || 'hybrid';
    let chunks: RetrievalChunk[];

    if (mode === 'semantic') {
      chunks = await semanticSearch(query, brain_id, top_k, brain, apiKey);
    } else if (mode === 'keyword') {
      chunks = await keywordSearch(query, brain_id, top_k);
    } else {
      chunks = await hybridSearch(query, brain_id, top_k, brain, apiKey);
    }

    // Build sources and context
    const sources = chunks.map(chunk => ({
      file_id: chunk.metadata.file_id,
      file_name: chunk.metadata.file_name,
      page_label: chunk.metadata.page_label,
      text_snippet: chunk.content.substring(0, 200),
      score: chunk.score,
    }));

    const context = chunks
      .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
      .join('\n\n');

    log.info({ chunkCount: chunks.length, latencyMs: Date.now() - startTime }, 'Retrieval complete');

    return { chunks, sources, context };
  } finally {
    clearEmbeddingCache();
  }
}

/**
 * Semantic (vector similarity) search using pgvector.
 */
async function semanticSearch(
  query: string,
  brainId: string,
  topK: number,
  brain: Brain,
  apiKey?: string
): Promise<RetrievalChunk[]> {
  const embeddingProvider = brain.embedding_provider || 'google';
  const embeddingModel = brain.embedding_model || 'text-embedding-004';

  const queryEmbedding = await embedQuery(query, embeddingProvider, embeddingModel, apiKey);

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_brain_id: brainId,
    match_count: topK,
  });

  if (error) {
    logger.error({ error: error.message, brainId }, 'Semantic search failed');
    throw new Error(`Semantic search failed: ${error.message}`);
  }

  return (data || []).map(mapResultToChunk);
}

/**
 * Full-text keyword search using PostgreSQL ts_vector.
 */
async function keywordSearch(
  query: string,
  brainId: string,
  topK: number
): Promise<RetrievalChunk[]> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Use PostgreSQL full-text search
  const { data, error } = await supabaseAdmin
    .from('document_sections')
    .select('id, content, metadata')
    .eq('brain_id', brainId)
    .eq('enabled', true)
    .textSearch('content', query, { type: 'websearch', config: 'english' })
    .limit(topK);

  if (error) {
    logger.error({ error: error.message, brainId }, 'Keyword search failed');
    // Fall back to ILIKE search if full-text search isn't configured
    const { data: fallbackData, error: fallbackError } = await supabaseAdmin
      .from('document_sections')
      .select('id, content, metadata')
      .eq('brain_id', brainId)
      .eq('enabled', true)
      .ilike('content', `%${query}%`)
      .limit(topK);

    if (fallbackError) {
      throw new Error(`Keyword search failed: ${fallbackError.message}`);
    }

    return (fallbackData || []).map((row, index) => ({
      id: row.id,
      content: row.content,
      metadata: row.metadata as RetrievalChunk['metadata'],
      score: 1 - (index * 0.1), // Assign decreasing scores
    }));
  }

  return (data || []).map((row, index) => ({
    id: row.id,
    content: row.content,
    metadata: row.metadata as RetrievalChunk['metadata'],
    score: 1 - (index * 0.1),
  }));
}

/**
 * Hybrid search combining semantic + keyword with Reciprocal Rank Fusion.
 */
async function hybridSearch(
  query: string,
  brainId: string,
  topK: number,
  brain: Brain,
  apiKey?: string
): Promise<RetrievalChunk[]> {
  // Run both searches in parallel
  const [semanticResults, keywordResults] = await Promise.allSettled([
    semanticSearch(query, brainId, topK * 2, brain, apiKey),
    keywordSearch(query, brainId, topK * 2),
  ]);

  const semanticChunks = semanticResults.status === 'fulfilled' ? semanticResults.value : [];
  const keywordChunks = keywordResults.status === 'fulfilled' ? keywordResults.value : [];

  if (semanticChunks.length === 0 && keywordChunks.length === 0) {
    return [];
  }

  if (semanticChunks.length === 0) return keywordChunks.slice(0, topK);
  if (keywordChunks.length === 0) return semanticChunks.slice(0, topK);

  // Apply Reciprocal Rank Fusion
  return reciprocalRankFusion(semanticChunks, keywordChunks, topK);
}

/**
 * Reciprocal Rank Fusion: combine two ranked lists into one.
 * RRF score = sum of 1/(k + rank) for each list.
 */
function reciprocalRankFusion(
  listA: RetrievalChunk[],
  listB: RetrievalChunk[],
  topK: number
): RetrievalChunk[] {
  const scores = new Map<string, { chunk: RetrievalChunk; score: number }>();

  // Score list A
  listA.forEach((chunk, rank) => {
    const existing = scores.get(chunk.id) || { chunk, score: 0 };
    existing.score += 1 / (RRF_K + rank + 1);
    if (!scores.has(chunk.id)) {
      scores.set(chunk.id, existing);
    } else {
      scores.get(chunk.id)!.score = existing.score;
    }
  });

  // Score list B
  listB.forEach((chunk, rank) => {
    const existing = scores.get(chunk.id) || { chunk, score: 0 };
    existing.score += 1 / (RRF_K + rank + 1);
    if (!scores.has(chunk.id)) {
      scores.set(chunk.id, existing);
    } else {
      scores.get(chunk.id)!.score = existing.score;
    }
  });

  // Sort by fused score
  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk, score }) => ({ ...chunk, score }));
}

function mapResultToChunk(row: Record<string, unknown>): RetrievalChunk {
  return {
    id: row.id as string,
    content: row.content as string,
    metadata: row.metadata as RetrievalChunk['metadata'],
    score: row.score as number ?? (row.similarity as number ?? 0),
  };
}
