export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BrainCreateRequest {
  name: string;
  description?: string;
  chat_model?: string;
  chat_provider?: string;
  embedding_model?: string;
  embedding_provider?: string;
}

export interface ConversationCreateRequest {
  brain_id: string;
  title?: string;
}

export interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  brain_id: string;
  conversation_id?: string;
}
