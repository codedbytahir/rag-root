import { performRetrieval } from './retriever';
import { rerank } from './reranker';
import type { RetrievalResult, RerankConfig } from './types';
import type { Brain } from '@/lib/db/schema';
import { DEFAULT_TOP_K } from '@/config/constants';
import { logger, createLogger } from '@/lib/logger';

interface RAGPipelineParams {
  query: string;
  brain_id: string;
  brain: Brain;
  top_k?: number;
  apiKey?: string;
}

/**
 * Main RAG pipeline orchestrator.
 * 1. Retrieve relevant chunks
 * 2. (Optional) Re-rank results
 * 3. Return structured result with context and sources
 */
export async function performRAG(params: RAGPipelineParams): Promise<RetrievalResult> {
  const { query, brain_id, brain, top_k, apiKey } = params;
  const log = createLogger({ brainId: brain_id, query: query.substring(0, 100) });
  const startTime = Date.now();

  log.info('RAG pipeline started');

  // Step 1: Retrieve
  let result = await performRetrieval({
    query,
    brain_id,
    brain,
    top_k: top_k || brain.max_context_chunks || DEFAULT_TOP_K,
    apiKey,
  });

  // Step 2: Re-rank if enabled
  if (brain.reranking_enabled) {
    const rerankConfig: RerankConfig = {
      enabled: true,
      model: brain.reranking_model || undefined,
      topN: brain.max_context_chunks || DEFAULT_TOP_K,
    };
    result.chunks = await rerank(query, result.chunks, rerankConfig);

    // Rebuild sources and context from reranked chunks
    result.sources = result.chunks.map((chunk, i) => ({
      file_id: chunk.metadata.file_id,
      file_name: chunk.metadata.file_name,
      page_label: chunk.metadata.page_label,
      text_snippet: chunk.content.substring(0, 200),
      score: chunk.score,
    }));

    result.context = result.chunks
      .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
      .join('\n\n');
  }

  log.info({
    chunkCount: result.chunks.length,
    latencyMs: Date.now() - startTime,
  }, 'RAG pipeline complete');

  return result;
}
