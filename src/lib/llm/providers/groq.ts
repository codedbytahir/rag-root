import { groq } from '@ai-sdk/groq';
import type { LLMProviderDefinition } from '../types';

export const groqProvider: LLMProviderDefinition = {
  id: 'groq',
  name: 'Groq',
  models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'] as const,
  defaultModel: 'llama-3.3-70b-versatile',
  requiresApiKey: true,
  apiKeyLabel: 'Groq API Key',
  apiKeyPrefix: 'gsk_',
  createModel: ({ apiKey, modelId }) => groq(modelId, { apiKey: apiKey } as any),
};
