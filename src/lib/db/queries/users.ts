import { requireDb } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { encrypt } from '@/lib/encryption';

export async function getProfile(userId: string) {
  const db = requireDb();
  return db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.id, userId),
  });
}

export async function upsertProfile(userId: string, data: {
  email?: string;
  full_name?: string;
  avatar_url?: string;
}) {
  const db = requireDb();
  await db.insert(profiles)
    .values({ id: userId, ...data })
    .onConflictDoUpdate({
      target: profiles.id,
      set: { ...data, updated_at: new Date() },
    });
}

export async function updateGlobalApiKeys(userId: string, data: {
  global_groq_api_key?: string;
  global_google_api_key?: string;
  openai_api_key_encrypted?: string;
  anthropic_api_key_encrypted?: string;
}) {
  const db = requireDb();
  const updateData: Record<string, unknown> = { updated_at: new Date() };
  
  if (data.global_groq_api_key && !data.global_groq_api_key.includes(':')) {
    updateData.global_groq_api_key = encrypt(data.global_groq_api_key);
  }
  if (data.global_google_api_key && !data.global_google_api_key.includes(':')) {
    updateData.global_google_api_key = encrypt(data.global_google_api_key);
  }
  if (data.openai_api_key_encrypted && !data.openai_api_key_encrypted.includes(':')) {
    updateData.openai_api_key_encrypted = encrypt(data.openai_api_key_encrypted);
  }
  if (data.anthropic_api_key_encrypted && !data.anthropic_api_key_encrypted.includes(':')) {
    updateData.anthropic_api_key_encrypted = encrypt(data.anthropic_api_key_encrypted);
  }
  
  await db.insert(profiles)
    .values({ id: userId, ...updateData })
    .onConflictDoUpdate({
      target: profiles.id,
      set: updateData,
    });
}
