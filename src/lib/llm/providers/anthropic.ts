import { anthropic } from '@ai-sdk/anthropic';
import type { LLMProviderDefinition } from '../types';

export const anthropicProvider: LLMProviderDefinition = {
  id: 'anthropic',
  name: 'Anthropic',
  models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'] as const,
  defaultModel: 'claude-sonnet-4-20250514',
  requiresApiKey: true,
  apiKeyLabel: 'Anthropic API Key',
  apiKeyPrefix: 'sk-ant-',
  createModel: ({ apiKey, modelId }) => anthropic(modelId, { apiKey: apiKey } as any),
};
