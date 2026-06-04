import { requireDb } from '@/lib/db';
import { messages } from '@/lib/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import type { NewMessage } from '@/lib/db/schema';

export async function createMessage(data: NewMessage) {
  const db = requireDb();
  const [message] = await db.insert(messages).values(data).returning();
  return message;
}

export async function getMessagesByConversation(conversationId: string) {
  const db = requireDb();
  return db.query.messages.findMany({
    where: (m, { eq }) => eq(m.conversation_id, conversationId),
    orderBy: [asc(messages.created_at)],
  });
}

export async function updateMessageFeedback(
  messageId: string,
  feedback: 'like' | 'dislike' | 'none',
  feedbackContent?: string
) {
  const db = requireDb();
  const [updated] = await db.update(messages)
    .set({ feedback, feedback_content: feedbackContent || null })
    .where(eq(messages.id, messageId))
    .returning();
  return updated;
}

export async function getLastAssistantMessage(conversationId: string) {
  const db = requireDb();
  const result = await db.query.messages.findMany({
    where: (m, { and, eq }) => and(eq(m.conversation_id, conversationId), eq(m.role, 'assistant')),
    orderBy: [desc(messages.created_at)],
    limit: 1,
  });
  return result[0] ?? null;
}
