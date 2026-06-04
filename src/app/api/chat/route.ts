import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { requireAuth } from '@/lib/auth/supabase-server';
import { verifyBrainOwnership, resolveBrainApiKeys } from '@/lib/db/queries/brains';
import { performRAG } from '@/lib/rag/pipeline';
import { createModel } from '@/lib/llm/provider-registry';
import { buildSystemPrompt } from '@/lib/prompts/templates';
import { createConversation, autoTitleConversation, incrementMessageCount } from '@/lib/db/queries/conversations';
import { createMessage } from '@/lib/db/queries/messages';
import { logUsage } from '@/lib/usage';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger, createLogger } from '@/lib/logger';
import { z } from 'zod';

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).min(1),
  brain_id: z.string().uuid(),
  conversation_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const body = await request.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, brain_id, conversation_id } = parsed.data;

    // Rate limit check
    const isAllowed = await checkRateLimit(userId);
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify brain ownership
    const brain = await verifyBrainOwnership(brain_id, userId);
    if (!brain) {
      return new Response(JSON.stringify({ error: 'Brain not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const log = createLogger({ brainId: brain_id, userId });
    log.info('Chat request received');

    // Resolve API keys
    const apiKeys = await resolveBrainApiKeys(brain, userId);

    // Get the user's query (last message)
    const userQuery = messages[messages.length - 1].content;

    // Create conversation if not provided
    let convId = conversation_id;
    if (!convId) {
      const conv = await createConversation(brain_id, userId);
      convId = conv.id;
    }

    // Perform RAG retrieval
    const retrievalResult = await performRAG({
      query: userQuery,
      brain_id,
      brain,
      apiKey: brain.embedding_provider === 'google' ? apiKeys.googleKey : apiKeys.openaiKey,
    });

    // Auto-title if this is the first message
    if (!conversation_id) {
      await autoTitleConversation(convId, userQuery);
    }

    // Save user message
    await createMessage({
      conversation_id: convId,
      role: 'user',
      content: userQuery,
    });
    await incrementMessageCount(convId);

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(brain, retrievalResult.context);

    // Determine API key for chat model
    const chatApiKey = getChatApiKey(brain.chat_provider || 'groq', apiKeys);

    // Create the LLM model
    const model = createModel(brain.chat_provider || 'groq', {
      apiKey: chatApiKey,
      modelId: brain.chat_model || 'llama-3.3-70b-versatile',
    });

    // Stream the response
    const result = streamText({
      model,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      onFinish: async ({ text, usage }) => {
        // Save assistant message after streaming completes
        await createMessage({
          conversation_id: convId!,
          role: 'assistant',
          content: text,
          sources: retrievalResult.sources,
          tokens_used: usage.totalTokens,
          model_used: brain.chat_model,
          provider: brain.chat_provider,
          latency_ms: Date.now() - startTime,
        });
        await incrementMessageCount(convId!);

        // Log usage
        await logUsage({
          userId,
          brainId: brain_id,
          conversationId: convId,
          status: 'success',
          tokens: usage.totalTokens,
          model: brain.chat_model || undefined,
          type: 'chat',
          latencyMs: Date.now() - startTime,
        });
      },
    });

    // Return streaming response with sources in headers
    return result.toDataStreamResponse({
      headers: {
        'X-Conversation-Id': convId,
        'X-Sources': encodeURIComponent(JSON.stringify(retrievalResult.sources)),
      },
    });
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    logger.error({ error: (error as Error).message }, 'Chat API error');
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function getChatApiKey(provider: string, apiKeys: Record<string, string>): string {
  const keyMap: Record<string, string> = {
    groq: apiKeys.groqKey,
    openai: apiKeys.openaiKey,
    anthropic: apiKeys.anthropicKey,
    google: apiKeys.googleKey,
    mistral: process.env.MISTRAL_API_KEY || '',
    deepseek: process.env.DEEPSEEK_API_KEY || '',
    openrouter: process.env.OPENROUTER_API_KEY || '',
    ollama: 'not-required',
  };
  return keyMap[provider] || '';
}
