import crypto from 'crypto';
import { API_KEY_PREFIX } from '@/config/constants';

/**
 * Generates a secure random API key and its hash.
 * Returns the raw key (shown once), the SHA-256 hash (stored in DB),
 * and a hint (displayed in the UI).
 */
export function generateApiKey(): { rawKey: string; hashedKey: string; hint: string } {
  const rawKey = `${API_KEY_PREFIX}${crypto.randomBytes(24).toString('hex')}`;

  const hashedKey = crypto
    .createHash('sha256')
    .update(rawKey)
    .digest('hex');

  const hint = `${rawKey.substring(0, 12)}...${rawKey.substring(rawKey.length - 4)}`;

  return { rawKey, hashedKey, hint };
}

/**
 * Hash an API key for comparison.
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
