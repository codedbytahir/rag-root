import { describe, it, expect } from 'vitest';
import { generateApiKey, hashApiKey } from '@/lib/api-key';
import crypto from 'crypto';

describe('generateApiKey', () => {
  it('should generate a key with the correct prefix', () => {
    const { rawKey } = generateApiKey();
    expect(rawKey).startsWith('rr_live_');
  });

  it('should generate a valid SHA-256 hash', () => {
    const { rawKey, hashedKey } = generateApiKey();
    const expectedHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    expect(hashedKey).toBe(expectedHash);
  });

  it('should generate a hint', () => {
    const { rawKey, hint } = generateApiKey();
    expect(hint).toContain('...');
    expect(hint.startsWith(rawKey.substring(0, 12))).toBe(true);
  });

  it('should generate unique keys', () => {
    const key1 = generateApiKey();
    const key2 = generateApiKey();
    expect(key1.rawKey).not.toBe(key2.rawKey);
  });
});

describe('hashApiKey', () => {
  it('should produce consistent hashes', () => {
    const key = 'rr_live_test123';
    const hash1 = hashApiKey(key);
    const hash2 = hashApiKey(key);
    expect(hash1).toBe(hash2);
  });

  it('should produce a 64-character hex string', () => {
    const hash = hashApiKey('test-key');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
