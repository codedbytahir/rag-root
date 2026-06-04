export interface ChatSource {
  file_id: string;
  file_name: string;
  page_label?: string;
  text_snippet: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: ChatSource[];
  tokens_used?: number;
  model_used?: string;
  provider?: string;
  latency_ms?: number;
  feedback?: 'like' | 'dislike' | 'none';
  feedback_content?: string;
  parent_message_id?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  brain_id: string;
  user_id: string;
  title: string;
  summary?: string;
  status: 'active' | 'archived';
  is_pinned: boolean;
  message_count: number;
  last_message_at: string;
  messages?: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ConversationListItem {
  id: string;
  title: string;
  status: 'active' | 'archived';
  is_pinned: boolean;
  message_count: number;
  last_message_at: string;
  created_at: string;
}
