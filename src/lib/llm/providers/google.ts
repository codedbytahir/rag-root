import { google } from '@ai-sdk/google';
import type { LLMProviderDefinition } from '../types';

export const googleProvider: LLMProviderDefinition = {
  id: 'google',
  name: 'Google AI',
  models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'] as const,
  defaultModel: 'gemini-1.5-pro',
  requiresApiKey: true,
  apiKeyLabel: 'Google AI API Key',
  apiKeyPrefix: 'AI',
  createModel: ({ apiKey, modelId }) => google(modelId, { apiKey: apiKey } as any),
  createEmbeddingModel: ({ apiKey, modelId }) => google.embedding(modelId, { apiKey: apiKey } as any),
};
