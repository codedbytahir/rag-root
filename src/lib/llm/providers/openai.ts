import { openai } from '@ai-sdk/openai';
import type { LLMProviderDefinition } from '../types';

export const openaiProvider: LLMProviderDefinition = {
  id: 'openai',
  name: 'OpenAI',
  models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] as const,
  defaultModel: 'gpt-4o',
  requiresApiKey: true,
  apiKeyLabel: 'OpenAI API Key',
  apiKeyPrefix: 'sk-',
  createModel: ({ apiKey, modelId }) => openai(modelId as any, { apiKey: apiKey } as any),
  createEmbeddingModel: ({ apiKey, modelId }) => openai.embedding(modelId as any, { apiKey: apiKey } as any),
};
