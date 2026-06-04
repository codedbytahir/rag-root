import { embed, embedMany } from 'ai';
import { createEmbeddingModel } from '@/lib/llm/provider-registry';
import { DEFAULT_EMBEDDING_MODEL, DEFAULT_EMBEDDING_PROVIDER, EMBEDDING_DIMENSIONS } from '@/config/models';
import { logger } from '@/lib/logger';

// Simple in-memory cache for embeddings during a single request
const embeddingCache = new Map<string, number[]>();

/**
 * Embed a single query string.
 * Uses caching to avoid re-embedding the same text.
 */
export async function embedQuery(
  text: string,
  provider: string = DEFAULT_EMBEDDING_PROVIDER,
  model: string = DEFAULT_EMBEDDING_MODEL,
  apiKey?: string
): Promise<number[]> {
  const cacheKey = `${provider}:${model}:${text}`;
  const cached = embeddingCache.get(cacheKey);
  if (cached) return cached;

  const effectiveApiKey = apiKey || getEnvApiKey(provider);
  
  try {
    const embeddingModel = createEmbeddingModel(provider, {
      apiKey: effectiveApiKey,
      modelId: model,
    });

    const { embedding } = await embed({
      model: embeddingModel,
      value: text,
    });

    embeddingCache.set(cacheKey, embedding);
    return embedding;
  } catch (error) {
    logger.error({ error, provider, model }, 'Embedding failed');
    throw new Error(`Embedding failed: ${(error as Error).message}`);
  }
}

/**
 * Embed multiple texts in batch.
 */
export async function embedBatch(
  texts: string[],
  provider: string = DEFAULT_EMBEDDING_PROVIDER,
  model: string = DEFAULT_EMBEDDING_MODEL,
  apiKey?: string
): Promise<number[][]> {
  const effectiveApiKey = apiKey || getEnvApiKey(provider);

  try {
    const embeddingModel = createEmbeddingModel(provider, {
      apiKey: effectiveApiKey,
      modelId: model,
    });

    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: texts,
    });

    return embeddings;
  } catch (error) {
    logger.error({ error, provider, model, count: texts.length }, 'Batch embedding failed');
    throw new Error(`Batch embedding failed: ${(error as Error).message}`);
  }
}

/**
 * Clear the embedding cache. Call at the end of a request lifecycle.
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
}

function getEnvApiKey(provider: string): string {
  const envMap: Record<string, string | undefined> = {
    google: process.env.GOOGLE_API_KEY,
    openai: process.env.OPENAI_API_KEY,
  };
  return envMap[provider] || '';
}
