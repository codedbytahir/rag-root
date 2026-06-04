import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LLMProviderDefinition } from '../types';

export const openrouterProvider: LLMProviderDefinition = {
  id: 'openrouter',
  name: 'OpenRouter',
  models: [] as const, // Models configured at runtime — OpenRouter proxies many providers
  defaultModel: 'openai/gpt-4o',
  requiresApiKey: true,
  apiKeyLabel: 'OpenRouter API Key',
  apiKeyPrefix: 'sk-or-',
  createModel: ({ apiKey, modelId }) => {
    const openrouter = createOpenAICompatible({
      name: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
    });
    return openrouter(modelId);
  },
};
