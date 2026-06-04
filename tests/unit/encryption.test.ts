import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt } from '@/lib/encryption';

beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test-encryption-key-must-be-32-chars!!';
});

describe('encryption', () => {
  it('should encrypt and decrypt text correctly', () => {
    const original = 'my-secret-api-key';
    const encrypted = encrypt(original);
    
    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain(':'); // Our format: iv:tag:ciphertext
    
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should return null for null input', () => {
    expect(encrypt(null)).toBeNull();
    expect(decrypt(null)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(encrypt(undefined)).toBeNull();
    expect(decrypt(undefined)).toBeNull();
  });

  it('should return empty string for empty string input', () => {
    const encrypted = encrypt('');
    expect(encrypted).not.toBeNull();
    if (encrypted) {
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe('');
    }
  });

  it('should produce different ciphertexts for same plaintext (random IV)', () => {
    const original = 'same-input';
    const encrypted1 = encrypt(original);
    const encrypted2 = encrypt(original);
    
    expect(encrypted1).not.toBe(encrypted2); // Different IVs
    
    expect(decrypt(encrypted1!)).toBe(original);
    expect(decrypt(encrypted2!)).toBe(original);
  });

  it('should handle legacy non-encrypted text', () => {
    const result = decrypt('plain-text-no-colons');
    expect(result).toBe('plain-text-no-colons');
  });
});
