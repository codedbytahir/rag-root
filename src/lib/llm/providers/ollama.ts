import { ollama } from 'ollama-ai-provider';
import type { LLMProviderDefinition } from '../types';

export const ollamaProvider: LLMProviderDefinition = {
  id: 'ollama',
  name: 'Ollama (Local)',
  models: [] as const,
  defaultModel: 'llama3',
  requiresApiKey: false,
  apiKeyLabel: 'Not required',
  apiKeyPrefix: '',
  createModel: ({ baseURL, modelId }) => ollama(modelId, { baseURL: baseURL } as any),
};
