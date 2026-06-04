import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('CRITICAL: ENCRYPTION_KEY is not defined in environment variables.');
  }
  // Ensure the key is 32 bytes by hashing it
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns format: iv:authTag:ciphertext (all hex encoded)
 */
export function encrypt(text: string | null | undefined): string | null {
  if (!text) return null;

  try {
    const encryptionKey = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${tag}:${encrypted}`;
  } catch (error) {
    console.error('[Encryption] Failed to encrypt:', (error as Error).message);
    throw error;
  }
}

/**
 * Decrypt a string encrypted with the encrypt function.
 * Returns null if input is null/undefined.
 * Falls back to returning the raw text if decryption fails (legacy data).
 */
export function decrypt(text: string | null | undefined): string | null {
  if (!text) return null;

  // If it doesn't look like our encrypted format, return as-is (legacy or plain text)
  if (!text.includes(':')) {
    return text;
  }

  try {
    const [ivHex, tagHex, encryptedHex] = text.split(':');
    if (!ivHex || !tagHex || !encryptedHex) return text;

    const encryptionKey = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[Encryption] Failed to decrypt:', (error as Error).message);
    return text; // Fallback to raw text if decryption fails
  }
}
