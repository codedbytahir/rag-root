/**
 * Model definitions and defaults for RAG ROOT.
 * Single source of truth for all model names, context windows, and max tokens.
 */

export const CHAT_MODELS = {
  groq: {
    'llama-3.3-70b-versatile': { name: 'Llama 3.3 70B', contextWindow: 128000, maxTokens: 8192 },
    'llama-3.1-8b-instant': { name: 'Llama 3.1 8B', contextWindow: 128000, maxTokens: 8192 },
    'mixtral-8x7b-32768': { name: 'Mixtral 8x7B', contextWindow: 32768, maxTokens: 8192 },
    'gemma2-9b-it': { name: 'Gemma 2 9B', contextWindow: 8192, maxTokens: 8192 },
  },
  openai: {
    'gpt-4o': { name: 'GPT-4o', contextWindow: 128000, maxTokens: 16384 },
    'gpt-4o-mini': { name: 'GPT-4o Mini', contextWindow: 128000, maxTokens: 16384 },
    'gpt-4-turbo': { name: 'GPT-4 Turbo', contextWindow: 128000, maxTokens: 4096 },
    'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', contextWindow: 16385, maxTokens: 4096 },
  },
  anthropic: {
    'claude-sonnet-4-20250514': { name: 'Claude Sonnet 4', contextWindow: 200000, maxTokens: 8192 },
    'claude-3-5-haiku-20241022': { name: 'Claude 3.5 Haiku', contextWindow: 200000, maxTokens: 8192 },
  },
  google: {
    'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', contextWindow: 2000000, maxTokens: 8192 },
    'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', contextWindow: 1000000, maxTokens: 8192 },
    'gemini-2.0-flash': { name: 'Gemini 2.0 Flash', contextWindow: 1048576, maxTokens: 8192 },
  },
  ollama: {
    // Populated dynamically from Ollama API at runtime
  },
  mistral: {
    'mistral-large-latest': { name: 'Mistral Large', contextWindow: 128000, maxTokens: 8192 },
    'mistral-small-latest': { name: 'Mistral Small', contextWindow: 32000, maxTokens: 8192 },
    'open-mistral-nemo': { name: 'Mistral Nemo', contextWindow: 128000, maxTokens: 8192 },
  },
  deepseek: {
    'deepseek-chat': { name: 'DeepSeek Chat', contextWindow: 128000, maxTokens: 8192 },
    'deepseek-reasoner': { name: 'DeepSeek Reasoner', contextWindow: 128000, maxTokens: 8192 },
  },
  openrouter: {
    // OpenRouter proxies other providers, models configured at runtime
  },
} as const;

export const EMBEDDING_MODELS = {
  google: {
    'text-embedding-004': { name: 'Text Embedding 004', dimensions: 768 },
    'gemini-embedding-exp-03-07': { name: 'Gemini Embedding', dimensions: 3072 },
  },
  openai: {
    'text-embedding-3-small': { name: 'Text Embedding 3 Small', dimensions: 1536 },
    'text-embedding-3-large': { name: 'Text Embedding 3 Large', dimensions: 3072 },
  },
} as const;

export const DEFAULT_CHAT_MODEL = 'llama-3.3-70b-versatile';
export const DEFAULT_CHAT_PROVIDER = 'groq';
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-004';
export const DEFAULT_EMBEDDING_PROVIDER = 'google';
export const EMBEDDING_DIMENSIONS = 768; // Must match text-embedding-004 output

export type ChatProvider = keyof typeof CHAT_MODELS;
export type EmbeddingProvider = keyof typeof EMBEDDING_MODELS;

/**
 * Get model info from the registry
 */
export function getModelInfo(provider: string, modelId: string) {
  const providerModels = CHAT_MODELS[provider as ChatProvider];
  if (!providerModels) return null;
  const modelInfo = providerModels[modelId as keyof typeof providerModels];
  return modelInfo ?? null;
}

/**
 * Get all available models for a provider
 */
export function getModelsForProvider(provider: string): string[] {
  const providerModels = CHAT_MODELS[provider as ChatProvider];
  if (!providerModels) return [];
  return Object.keys(providerModels);
}
