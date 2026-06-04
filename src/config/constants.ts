/**
 * App-wide constants for RAG ROOT.
 */

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
export const RATE_LIMIT_MAX_REQUESTS = 50; // requests per window (upgraded from 10)

// File upload limits
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'text/html',
] as const;

export const FILE_EXTENSIONS_MAP: Record<string, string> = {
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'text/csv': '.csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/html': '.html',
};

// RAG defaults
export const DEFAULT_CHUNK_SIZE = 1024;
export const DEFAULT_CHUNK_OVERLAP = 200;
export const DEFAULT_TOP_K = 5;
export const DEFAULT_MAX_CONTEXT_CHUNKS = 5;
export const MIN_CHUNK_SIZE = 128;
export const MAX_CHUNK_SIZE = 4096;

// Citation format
export const DEFAULT_CITATION_FORMAT = '[{{number}}]';

// RRF constant for hybrid search
export const RRF_K = 60;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// API Key prefix
export const API_KEY_PREFIX = 'rr_live_';

// Conversation
export const MAX_CONVERSATION_TITLE_LENGTH = 500;
export const AUTO_TITLE_MAX_LENGTH = 80;
