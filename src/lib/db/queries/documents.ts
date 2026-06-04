import { requireDb } from '@/lib/db';
import { files, documentSections, brains } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function listFiles(brainId: string) {
  const db = requireDb();
  return db.query.files.findMany({
    where: (f, { eq }) => eq(f.brain_id, brainId),
    orderBy: [desc(files.created_at)],
    columns: {
      id: true,
      file_name: true,
      file_size: true,
      file_type: true,
      storage_path: true,
      status: true,
      chunk_count: true,
      created_at: true,
    },
  });
}

export async function createFile(data: {
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  storage_path: string;
  brain_id: string;
  user_id: string;
}) {
  const db = requireDb();
  const [file] = await db.insert(files).values(data).returning();
  
  // Increment brain file count
  await db.update(brains)
    .set({ file_count: sql`${brains.file_count} + 1` })
    .where(eq(brains.id, data.brain_id));
  
  return file;
}

export async function deleteFile(fileId: string, userId: string) {
  const db = requireDb();
  
  // First verify ownership
  const file = await db.query.files.findFirst({
    where: (f, { and, eq }) => and(eq(f.id, fileId), eq(f.user_id, userId)),
  });
  
  if (!file) return null;
  
  // Delete document sections (vectors) for this file
  await db.delete(documentSections).where(eq(documentSections.document_id, fileId));
  
  // Delete the file record
  await db.delete(files).where(eq(files.id, fileId));
  
  // Decrement brain file count
  await db.update(brains)
    .set({ file_count: sql`GREATEST(${brains.file_count} - 1, 0)` })
    .where(eq(brains.id, file.brain_id));
  
  return file;
}

export async function updateFileStatus(fileId: string, status: 'pending' | 'processing' | 'ready' | 'error', errorMessage?: string) {
  const db = requireDb();
  await db.update(files)
    .set({ status, error_message: errorMessage || null, updated_at: new Date() })
    .where(eq(files.id, fileId));
}

export async function getFileById(fileId: string) {
  const db = requireDb();
  return db.query.files.findFirst({
    where: (f, { eq }) => eq(f.id, fileId),
  });
}
