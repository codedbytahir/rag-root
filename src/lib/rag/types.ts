export interface RetrievalChunk {
  id: string;
  content: string;
  metadata: {
    file_id: string;
    file_name: string;
    page_label?: string;
    chunk_index: number;
    custom_tags?: string[];
  };
  score: number;
}

export interface RetrievalResult {
  chunks: RetrievalChunk[];
  sources: Array<{
    file_id: string;
    file_name: string;
    page_label?: string;
    text_snippet: string;
    score: number;
  }>;
  context: string;
}

export interface IngestionResult {
  success: boolean;
  chunkCount: number;
  error?: string;
}

export interface ChunkingConfig {
  strategy: 'auto' | 'fixed' | 'sentence' | 'paragraph';
  chunkSize: number;
  chunkOverlap: number;
}

export interface RerankConfig {
  enabled: boolean;
  model?: string;
  topN?: number;
}
