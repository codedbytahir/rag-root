import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Create a Drizzle ORM client using the Supabase direct database URL.
 * Falls back to using the Supabase client for queries if no direct URL available.
 */

// For migrations and direct SQL access
function createDbClient() {
  const directUrl = process.env.SUPABASE_DATABASE_URL;
  if (directUrl) {
    const client = postgres(directUrl, { prepare: false });
    return drizzle(client, { schema });
  }
  return null;
}

// Lazy singleton
let _db: ReturnType<typeof createDbClient> = null;

export function getDb() {
  if (!_db) {
    _db = createDbClient();
  }
  return _db;
}

/**
 * Get the Drizzle DB instance.
 * Throws if SUPABASE_DATABASE_URL is not configured.
 */
export function requireDb() {
  const db = getDb();
  if (!db) {
    throw new Error('SUPABASE_DATABASE_URL is not configured. Drizzle ORM requires a direct PostgreSQL connection.');
  }
  return db;
}

export { schema };
