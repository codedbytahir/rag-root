import type { RetrievalChunk, RerankConfig } from './types';
import { logger } from '@/lib/logger';

/**
 * Re-rank retrieval results using either a Cohere reranker or score-based heuristics.
 */
export async function rerank(
  query: string,
  chunks: RetrievalChunk[],
  config: RerankConfig
): Promise<RetrievalChunk[]> {
  if (!config.enabled || chunks.length === 0) {
    return chunks;
  }

  const topN = config.topN || chunks.length;

  try {
    if (config.model === 'cohere') {
      return await cohereRerank(query, chunks, topN);
    }
    // Default: score-based reranking with diversity
    return diversityRerank(chunks, topN);
  } catch (error) {
    logger.error({ error }, 'Reranking failed, returning original order');
    return chunks.slice(0, topN);
  }
}

/**
 * Cohere-based reranking (requires COHERE_API_KEY).
 */
async function cohereRerank(
  query: string,
  chunks: RetrievalChunk[],
  topN: number
): Promise<RetrievalChunk[]> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    logger.warn('COHERE_API_KEY not set, falling back to diversity reranking');
    return diversityRerank(chunks, topN);
  }

  const response = await fetch('https://api.cohere.ai/v1/rerank', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'rerank-english-v3.0',
      query,
      documents: chunks.map(c => c.content),
      top_n: topN,
    }),
  });

  if (!response.ok) {
    throw new Error(`Cohere reranking API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results.map((result: { index: number; relevance_score: number }) => ({
    ...chunks[result.index],
    score: result.relevance_score,
  }));
}

/**
 * Diversity-based reranking: ensure results come from different documents.
 */
function diversityRerank(chunks: RetrievalChunk[], topN: number): RetrievalChunk[] {
  const seen = new Set<string>();
  const result: RetrievalChunk[] = [];

  // First pass: take highest-scored chunk from each document
  for (const chunk of chunks) {
    if (result.length >= topN) break;
    if (!seen.has(chunk.metadata.file_id)) {
      seen.add(chunk.metadata.file_id);
      result.push(chunk);
    }
  }

  // Second pass: fill remaining slots with best chunks regardless of document
  for (const chunk of chunks) {
    if (result.length >= topN) break;
    if (!result.find(c => c.id === chunk.id)) {
      result.push(chunk);
    }
  }

  return result;
}
