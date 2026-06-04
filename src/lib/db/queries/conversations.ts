import { requireDb } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { AUTO_TITLE_MAX_LENGTH } from '@/config/constants';

export async function listConversations(brainId: string, userId: string) {
  const db = requireDb();
  return db.query.conversations.findMany({
    where: (c, { and, eq }) => and(eq(c.brain_id, brainId), eq(c.user_id, userId)),
    orderBy: [desc(conversations.last_message_at)],
    columns: {
      id: true,
      title: true,
      status: true,
      is_pinned: true,
      message_count: true,
      last_message_at: true,
      created_at: true,
    },
  });
}

export async function getConversationWithMessages(conversationId: string, userId: string) {
  const db = requireDb();
  return db.query.conversations.findFirst({
    where: (c, { and, eq }) => and(eq(c.id, conversationId), eq(c.user_id, userId)),
    with: {
      messages: {
        orderBy: [asc(messages.created_at)],
      },
    },
  });
}

export async function createConversation(brainId: string, userId: string, title?: string) {
  const db = requireDb();
  const [conversation] = await db.insert(conversations).values({
    brain_id: brainId,
    user_id: userId,
    title: title || 'New Conversation',
    last_message_at: new Date(),
  }).returning();
  return conversation;
}

export async function updateConversation(conversationId: string, userId: string, data: {
  title?: string;
  status?: 'active' | 'archived';
  is_pinned?: boolean;
}) {
  const db = requireDb();
  const [updated] = await db.update(conversations)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(conversations.id, conversationId), eq(conversations.user_id, userId)))
    .returning();
  return updated;
}

export async function deleteConversation(conversationId: string, userId: string) {
  const db = requireDb();
  await db.delete(conversations).where(
    and(eq(conversations.id, conversationId), eq(conversations.user_id, userId))
  );
}

export async function autoTitleConversation(conversationId: string, firstMessage: string) {
  const db = requireDb();
  const title = firstMessage.slice(0, AUTO_TITLE_MAX_LENGTH) + (firstMessage.length > AUTO_TITLE_MAX_LENGTH ? '...' : '');
  await db.update(conversations)
    .set({ title, updated_at: new Date() })
    .where(eq(conversations.id, conversationId));
  return title;
}

export async function incrementMessageCount(conversationId: string) {
  const db = requireDb();
  await db.update(conversations)
    .set({
      message_count: sql`${conversations.message_count} + 1`,
      last_message_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(conversations.id, conversationId));
}
