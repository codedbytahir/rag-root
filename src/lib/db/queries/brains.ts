import { requireDb } from '@/lib/db';
import { brains, profiles } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { decrypt } from '@/lib/encryption';
import type { Brain } from '@/lib/db/schema';

export async function listBrains(userId: string) {
  const db = requireDb();
  return db.query.brains.findMany({
    where: (b, { eq }) => eq(b.user_id, userId),
    orderBy: [desc(brains.created_at)],
  });
}

export async function getBrainById(brainId: string, userId: string) {
  const db = requireDb();
  return db.query.brains.findFirst({
    where: (b, { and, eq }) => and(eq(b.id, brainId), eq(b.user_id, userId)),
  });
}

export async function getBrainWithFiles(brainId: string, userId: string) {
  const db = requireDb();
  return db.query.brains.findFirst({
    where: (b, { and, eq }) => and(eq(b.id, brainId), eq(b.user_id, userId)),
    with: {
      files: {
        orderBy: [desc(brains.created_at)],
      },
    },
  });
}

export async function createBrain(data: {
  name: string;
  description?: string;
  user_id: string;
  chat_model?: string;
  chat_provider?: string;
  embedding_model?: string;
  embedding_provider?: string;
}) {
  const db = requireDb();
  const [brain] = await db.insert(brains).values({
    name: data.name,
    description: data.description,
    user_id: data.user_id,
    chat_model: data.chat_model || 'llama-3.3-70b-versatile',
    chat_provider: data.chat_provider || 'groq',
    embedding_model: data.embedding_model || 'text-embedding-004',
    embedding_provider: data.embedding_provider || 'google',
    status: 'ready',
  }).returning();
  return brain;
}

export async function updateBrain(brainId: string, userId: string, data: Partial<Brain>) {
  const db = requireDb();
  const [updated] = await db.update(brains)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(brains.id, brainId), eq(brains.user_id, userId)))
    .returning();
  return updated;
}

export async function deleteBrain(brainId: string, userId: string) {
  const db = requireDb();
  await db.delete(brains).where(and(eq(brains.id, brainId), eq(brains.user_id, userId)));
}

export async function verifyBrainOwnership(brainId: string, userId: string): Promise<Brain | null> {
  const db = requireDb();
  const brain = await db.query.brains.findFirst({
    where: (b, { and, eq }) => and(eq(b.id, brainId), eq(b.user_id, userId)),
  });
  return brain ?? null;
}

/**
 * Resolve the API keys for a brain, checking global keys as fallback.
 */
export async function resolveBrainApiKeys(brain: Brain, userId: string) {
  const db = requireDb();
  
  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.id, userId),
  });

  let groqKey = process.env.GROQ_API_KEY || '';
  let googleKey = process.env.GOOGLE_API_KEY || '';
  let openaiKey = process.env.OPENAI_API_KEY || '';
  let anthropicKey = process.env.ANTHROPIC_API_KEY || '';

  if (brain.use_global_keys && profile) {
    if (profile.global_groq_api_key) groqKey = decrypt(profile.global_groq_api_key) || groqKey;
    if (profile.global_google_api_key) googleKey = decrypt(profile.global_google_api_key) || googleKey;
    if (profile.openai_api_key_encrypted) openaiKey = decrypt(profile.openai_api_key_encrypted) || openaiKey;
    if (profile.anthropic_api_key_encrypted) anthropicKey = decrypt(profile.anthropic_api_key_encrypted) || anthropicKey;
  } else {
    if (brain.groq_api_key) groqKey = decrypt(brain.groq_api_key) || groqKey;
    if (brain.google_api_key) googleKey = decrypt(brain.google_api_key) || googleKey;
  }

  return { groqKey, googleKey, openaiKey, anthropicKey };
}
