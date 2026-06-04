import type { LanguageModelV1 } from 'ai';

export interface LLMProviderConfig {
  apiKey: string;
  baseURL?: string;
  modelId: string;
}

export interface LLMProviderDefinition {
  id: string;
  name: string;
  models: readonly string[];
  defaultModel: string;
  requiresApiKey: boolean;
  apiKeyLabel: string;
  apiKeyPrefix: string;
  createModel: (config: LLMProviderConfig) => any; // eslint-disable-line
  createEmbeddingModel?: (config: LLMProviderConfig) => any; // eslint-disable-line
}

export interface ChatCompletionOptions {
  provider: string;
  modelId: string;
  apiKey: string;
  baseURL?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  system?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}
