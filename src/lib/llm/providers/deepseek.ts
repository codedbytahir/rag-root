import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LLMProviderDefinition } from '../types';

export const deepseekProvider: LLMProviderDefinition = {
  id: 'deepseek',
  name: 'DeepSeek',
  models: ['deepseek-chat', 'deepseek-reasoner'] as const,
  defaultModel: 'deepseek-chat',
  requiresApiKey: true,
  apiKeyLabel: 'DeepSeek API Key',
  apiKeyPrefix: 'sk-',
  createModel: ({ apiKey, modelId }) => {
    const deepseek = createOpenAICompatible({
      name: 'deepseek',
      baseURL: 'https://api.deepseek.com/v1',
      apiKey,
    });
    return deepseek(modelId);
  },
};
