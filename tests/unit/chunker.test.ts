import { describe, it, expect } from 'vitest';
import { chunkText } from '@/lib/rag/chunker';

describe('chunkText', () => {
  it('should split text into fixed-size chunks', () => {
    const text = 'A'.repeat(200);
    const chunks = chunkText(text, { strategy: 'fixed', chunkSize: 100, chunkOverlap: 20 });

    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach(chunk => {
      expect(chunk.content.length).toBeLessThanOrEqual(120); // Allow for overlap
      expect(chunk.metadata.chunk_index).toBeGreaterThanOrEqual(0);
    });
  });

  it('should handle empty text', () => {
    const chunks = chunkText('');
    expect(chunks).toEqual([]);
  });

  it('should handle text shorter than chunk size', () => {
    const text = 'Short text';
    const chunks = chunkText(text, { strategy: 'fixed', chunkSize: 1000 });
    expect(chunks.length).toBe(1);
    expect(chunks[0].content).toBe(text);
  });

  it('should split by sentences', () => {
    const text = 'First sentence. Second sentence. Third sentence. Fourth sentence.';
    const chunks = chunkText(text, { strategy: 'sentence', chunkSize: 50, chunkOverlap: 10 });
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('should split by paragraphs', () => {
    const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
    const chunks = chunkText(text, { strategy: 'paragraph', chunkSize: 50, chunkOverlap: 10 });
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('should use auto strategy', () => {
    const text = 'First paragraph.\n\nSecond paragraph.';
    const chunks = chunkText(text, { strategy: 'auto', chunkSize: 100 });
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('should respect min/max chunk size limits', () => {
    const text = 'A'.repeat(10000);
    const chunks = chunkText(text, { strategy: 'fixed', chunkSize: 1, chunkOverlap: 0 });
    // chunkSize should be clamped to MIN_CHUNK_SIZE (128)
    expect(chunks.length).toBeLessThan(10000);
  });
});
