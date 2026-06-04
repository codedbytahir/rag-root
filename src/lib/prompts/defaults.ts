/**
 * Default prompt templates for RAG ROOT.
 * These serve as fallbacks when brain-specific prompts aren't configured.
 */

export const DEFAULT_SYSTEM_PROMPT = `You are an AI assistant powered by RAG ROOT. You answer questions based on the documents uploaded to your knowledge base.

Guidelines:
- Answer based on the provided context from documents
- Cite sources using [1], [2], etc.
- If context is insufficient, say so honestly
- Be accurate, concise, and helpful
- Use markdown formatting`;

export const DEFAULT_NO_CONTEXT_PROMPT = `I don't have information about that in my knowledge base. You can upload more documents to help me answer this type of question.`;

export const SUGGESTED_QUESTIONS_PROMPT = `Based on the retrieved context, suggest 3 follow-up questions the user might want to ask. Return them as a JSON array of strings, nothing else.`;

export const CONVERSATION_TITLE_PROMPT = `Generate a very short title (max 6 words) for a conversation that starts with this message. Only return the title text, nothing else.`;
