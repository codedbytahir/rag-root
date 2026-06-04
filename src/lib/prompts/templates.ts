import type { Brain } from '@/lib/db/schema';

/**
 * Build the system prompt for a chat session.
 * Combines the brain's custom system prompt with retrieved context.
 */
export function buildSystemPrompt(brain: Brain, context: string): string {
  const basePrompt = brain.system_prompt || getDefaultSystemPrompt(brain.name);
  const noContextPrompt = brain.no_context_prompt || "I don't have information about that in my knowledge base.";

  if (!context || context.trim().length === 0) {
    return `${basePrompt}\n\n${noContextPrompt}`;
  }

  return `${basePrompt}

## Retrieved Context

Use the following context to answer the user's question. Always cite your sources using the citation format [number] where the number corresponds to the source number in the context. If the context doesn't contain relevant information, say: "${noContextPrompt}"

---
${context}
---

## Instructions
- Answer based ONLY on the provided context
- Cite sources using [1], [2], etc. format
- If the context is insufficient, acknowledge it honestly
- Be concise but thorough
- Use markdown formatting for better readability`;
}

/**
 * Get the default system prompt for a brain.
 */
function getDefaultSystemPrompt(brainName: string): string {
  return `You are an AI assistant for the knowledge base "${brainName}". Your role is to answer questions based on the documents that have been uploaded to this knowledge base.

You have access to retrieved context from the user's documents. Use this context to provide accurate, grounded answers. Always cite your sources.

Key behaviors:
- Answer questions based on the provided document context
- If you're unsure or the context doesn't contain the answer, say so honestly
- Provide specific citations referencing the source documents
- Be helpful, accurate, and concise
- Use markdown formatting for better readability`;
}

/**
 * Build a prompt for generating conversation titles.
 */
export function buildTitlePrompt(firstMessage: string): string {
  return `Generate a very short title (max 6 words) for a conversation that starts with this message: "${firstMessage}". Only return the title, nothing else.`;
}

/**
 * Build a prompt for summarizing a conversation.
 */
export function buildSummaryPrompt(messages: Array<{ role: string; content: string }>): string {
  const conversationText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  return `Summarize the following conversation in 2-3 sentences. Focus on the key topics discussed:\n\n${conversationText}`;
}
