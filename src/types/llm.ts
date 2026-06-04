export interface LLMProviderInfo {
  id: string;
  name: string;
  models: string[];
  defaultModel: string;
  requiresApiKey: boolean;
  apiKeyLabel: string;
  apiKeyPrefix: string;
}

export interface ModelInfo {
  name: string;
  contextWindow: number;
  maxTokens: number;
}
