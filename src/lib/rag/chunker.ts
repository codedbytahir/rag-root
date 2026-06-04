import type { ChunkingConfig } from './types';
import { DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP, MIN_CHUNK_SIZE, MAX_CHUNK_SIZE } from '@/config/constants';

interface Chunk {
  content: string;
  metadata: {
    chunk_index: number;
    start_char?: number;
    end_char?: number;
  };
}

/**
 * Split text into chunks based on the configured strategy.
 */
export function chunkText(
  text: string,
  config: Partial<ChunkingConfig> = {}
): Chunk[] {
  const strategy = config.strategy || 'auto';
  const chunkSize = Math.max(MIN_CHUNK_SIZE, Math.min(MAX_CHUNK_SIZE, config.chunkSize || DEFAULT_CHUNK_SIZE));
  const chunkOverlap = Math.min(config.chunkOverlap || DEFAULT_CHUNK_OVERLAP, Math.floor(chunkSize / 2));

  switch (strategy) {
    case 'fixed':
      return fixedChunking(text, chunkSize, chunkOverlap);
    case 'sentence':
      return sentenceChunking(text, chunkSize, chunkOverlap);
    case 'paragraph':
      return paragraphChunking(text, chunkSize, chunkOverlap);
    case 'auto':
    default:
      return autoChunking(text, chunkSize, chunkOverlap);
  }
}

/**
 * Fixed-size chunking with overlap.
 */
function fixedChunking(text: string, chunkSize: number, overlap: number): Chunk[] {
  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const content = text.slice(start, end).trim();

    if (content.length > 0) {
      chunks.push({
        content,
        metadata: { chunk_index: index, start_char: start, end_char: end },
      });
      index++;
    }

    start += chunkSize - overlap;
    if (start >= text.length) break;
    if (start < 0) start = 0;
  }

  return chunks;
}

/**
 * Sentence-based chunking. Splits on sentence boundaries.
 */
function sentenceChunking(text: string, chunkSize: number, overlap: number): Chunk[] {
  // Split on sentence-ending punctuation
  const sentences = text.split(/(?<=[.!?])\s+/);
  return mergeSegments(sentences, chunkSize, overlap);
}

/**
 * Paragraph-based chunking. Splits on double newlines.
 */
function paragraphChunking(text: string, chunkSize: number, overlap: number): Chunk[] {
  const paragraphs = text.split(/\n\s*\n/);
  return mergeSegments(paragraphs, chunkSize, overlap);
}

/**
 * Auto chunking: use paragraph splitting if paragraphs are well-defined,
 * otherwise fall back to sentence splitting.
 */
function autoChunking(text: string, chunkSize: number, overlap: number): Chunk[] {
  const hasParagraphs = text.includes('\n\n');
  if (hasParagraphs) {
    return paragraphChunking(text, chunkSize, overlap);
  }
  return sentenceChunking(text, chunkSize, overlap);
}

/**
 * Merge small segments into chunks up to chunkSize.
 */
function mergeSegments(segments: string[], chunkSize: number, overlap: number): Chunk[] {
  const chunks: Chunk[] = [];
  let currentChunk = '';
  let index = 0;
  let charPosition = 0;

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    // If adding this segment exceeds chunk size and we have content, save the chunk
    if (currentChunk.length + trimmed.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: { chunk_index: index, start_char: charPosition, end_char: charPosition + currentChunk.length },
      });
      index++;
      charPosition += currentChunk.length;

      // Keep overlap from the end of the previous chunk
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + ' ' + trimmed;
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + trimmed : trimmed;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: { chunk_index: index, start_char: charPosition, end_char: charPosition + currentChunk.length },
    });
  }

  return chunks;
}
