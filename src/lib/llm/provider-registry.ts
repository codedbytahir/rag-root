import type { LLMProviderDefinition, LLMProviderConfig } from './types';
import { openaiProvider } from './providers/openai';
import { anthropicProvider } from './providers/anthropic';
import { googleProvider } from './providers/google';
import { groqProvider } from './providers/groq';
import { ollamaProvider } from './providers/ollama';
import { mistralProvider } from './providers/mistral';
import { deepseekProvider } from './providers/deepseek';
import { openrouterProvider } from './providers/openrouter';
import { logger } from '@/lib/logger';

const providers = new Map<string, LLMProviderDefinition>();

export function registerProvider(provider: LLMProviderDefinition): void {
  providers.set(provider.id, provider);
  logger.debug({ providerId: provider.id, providerName: provider.name }, 'LLM provider registered');
}

export function getProvider(providerId: string): LLMProviderDefinition {
  const provider = providers.get(providerId);
  if (!provider) throw new Error(`Unknown LLM provider: ${providerId}`);
  return provider;
}

export function getAllProviders(): LLMProviderDefinition[] {
  return Array.from(providers.values());
}

export function createModel(providerId: string, config: LLMProviderConfig) {
  const provider = getProvider(providerId);
  return provider.createModel(config);
}

export function createEmbeddingModel(providerId: string, config: LLMProviderConfig) {
  const provider = getProvider(providerId);
  if (!provider.createEmbeddingModel) {
    throw new Error(`Provider ${providerId} does not support embedding models`);
  }
  return provider.createEmbeddingModel(config);
}

// Register all built-in providers
[
  openaiProvider,
  anthropicProvider,
  googleProvider,
  groqProvider,
  ollamaProvider,
  mistralProvider,
  deepseekProvider,
  openrouterProvider,
].forEach(registerProvider);
