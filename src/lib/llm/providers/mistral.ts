import { mistral } from '@ai-sdk/mistral';
import type { LLMProviderDefinition } from '../types';

export const mistralProvider: LLMProviderDefinition = {
  id: 'mistral',
  name: 'Mistral AI',
  models: ['mistral-large-latest', 'mistral-small-latest', 'open-mistral-nemo'] as const,
  defaultModel: 'mistral-large-latest',
  requiresApiKey: true,
  apiKeyLabel: 'Mistral API Key',
  apiKeyPrefix: '',
  createModel: ({ apiKey, modelId }) => mistral(modelId, { apiKey: apiKey } as any),
};
