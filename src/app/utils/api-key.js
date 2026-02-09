import { crypto } from 'node:crypto';

/**
 * Generates a secure random API key and its hash
 */
export function generateApiKey() {
  // 1. Create the raw key
  const rawKey = `rr_live_${require('crypto').randomBytes(24).toString('hex')}`;
  
  // 2. Create the hash (what we save in DB)
  const hashedKey = require('crypto')
    .createHash('sha256')
    .update(rawKey)
    .digest('hex');

  // 3. Create a hint (what the user sees in the list)
  const hint = `${rawKey.substring(0, 12)}...${rawKey.substring(rawKey.length - 4)}`;

  return { rawKey, hashedKey, hint };
}