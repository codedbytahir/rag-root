import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  pgEnum,
  index,
  vector,
} from 'drizzle-orm/pg-core';

// ─── Enums ──────────────────────────────────────────────
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);
export const feedbackEnum = pgEnum('feedback', ['none', 'like', 'dislike']);
export const conversationStatusEnum = pgEnum('conversation_status', ['active', 'archived']);
export const brainStatusEnum = pgEnum('brain_status', ['ready', 'building', 'error']);
export const documentStatusEnum = pgEnum('document_status', ['pending', 'processing', 'ready', 'error']);

// ─── Auth (managed by Supabase, reference only) ──────────
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }),
  full_name: varchar('full_name', { length: 255 }),
  avatar_url: text('avatar_url'),
  global_groq_api_key: text('global_groq_api_key'),
  global_google_api_key: text('global_google_api_key'),
  openai_api_key_encrypted: text('openai_api_key_encrypted'),
  anthropic_api_key_encrypted: text('anthropic_api_key_encrypted'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Brains (Knowledge Bases) ───────────────────────────
export const brains = pgTable('brains', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: brainStatusEnum('status').default('building'),
  chat_model: varchar('chat_model', { length: 100 }).default('llama-3.3-70b-versatile'),
  chat_provider: varchar('chat_provider', { length: 50 }).default('groq'),
  embedding_model: varchar('embedding_model', { length: 100 }).default('text-embedding-004'),
  embedding_provider: varchar('embedding_provider', { length: 50 }).default('google'),
  groq_api_key: text('groq_api_key'),
  google_api_key: text('google_api_key'),
  use_global_keys: boolean('use_global_keys').default(true),
  // Prompt configuration
  system_prompt: text('system_prompt'),
  no_context_prompt: text('no_context_prompt').default("I don't have information about that in my knowledge base."),
  citation_format: varchar('citation_format', { length: 50 }).default('[{{number}}]'),
  max_context_chunks: integer('max_context_chunks').default(5),
  // RAG configuration
  chunking_strategy: varchar('chunking_strategy', { length: 50 }).default('auto'),
  chunk_size: integer('chunk_size').default(1024),
  chunk_overlap: integer('chunk_overlap').default(200),
  retrieval_mode: varchar('retrieval_mode', { length: 50 }).default('hybrid'),
  reranking_enabled: boolean('reranking_enabled').default(false),
  reranking_model: varchar('reranking_model', { length: 100 }),
  // Metadata
  file_count: integer('file_count').default(0),
  total_tokens_used: integer('total_tokens_used').default(0),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('brains_user_id_idx').on(table.user_id),
]);

// ─── Files/Documents ────────────────────────────────────
export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  brain_id: uuid('brain_id').notNull().references(() => brains.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  file_name: varchar('file_name', { length: 500 }).notNull(),
  file_size: integer('file_size'),
  file_type: varchar('file_type', { length: 50 }),
  storage_path: text('storage_path').notNull(),
  status: documentStatusEnum('status').default('pending'),
  chunk_count: integer('chunk_count').default(0),
  error_message: text('error_message'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('files_brain_id_idx').on(table.brain_id),
  index('files_user_id_idx').on(table.user_id),
]);

// ─── Document Segments (with vectors) ───────────────────
export const documentSections = pgTable('document_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  document_id: uuid('document_id').notNull().references(() => files.id, { onDelete: 'cascade' }),
  brain_id: uuid('brain_id').notNull().references(() => brains.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 768 }),
  metadata: jsonb('metadata').$type<{
    file_id: string;
    file_name: string;
    page_label?: string;
    chunk_index: number;
    custom_tags?: string[];
  }>().notNull(),
  token_count: integer('token_count'),
  enabled: boolean('enabled').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('document_sections_brain_id_idx').on(table.brain_id),
  index('document_sections_document_id_idx').on(table.document_id),
]);

// ─── Conversations ──────────────────────────────────────
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  brain_id: uuid('brain_id').notNull().references(() => brains.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }),
  summary: text('summary'),
  status: conversationStatusEnum('status').default('active'),
  is_pinned: boolean('is_pinned').default(false),
  message_count: integer('message_count').default(0),
  last_message_at: timestamp('last_message_at', { withTimezone: true }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('conversations_brain_id_idx').on(table.brain_id),
  index('conversations_user_id_idx').on(table.user_id),
  index('conversations_last_message_idx').on(table.last_message_at),
]);

// ─── Messages ───────────────────────────────────────────
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversation_id: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  sources: jsonb('sources').$type<Array<{
    file_id: string;
    file_name: string;
    page_label?: string;
    text_snippet: string;
    score: number;
  }>>(),
  tokens_used: integer('tokens_used'),
  model_used: varchar('model_used', { length: 100 }),
  provider: varchar('provider', { length: 50 }),
  latency_ms: integer('latency_ms'),
  feedback: feedbackEnum('feedback').default('none'),
  feedback_content: text('feedback_content'),
  parent_message_id: uuid('parent_message_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('messages_conversation_id_idx').on(table.conversation_id),
  index('messages_parent_idx').on(table.parent_message_id),
]);

// ─── API Keys ───────────────────────────────────────────
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).default('Default'),
  key_hint: varchar('key_hint', { length: 20 }),
  hashed_key: varchar('hashed_key', { length: 64 }).notNull(),
  last_used_at: timestamp('last_used_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('api_keys_user_id_idx').on(table.user_id),
  index('api_keys_hashed_key_idx').on(table.hashed_key),
]);

// ─── Request Logs ───────────────────────────────────────
export const requestLogs = pgTable('request_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
  brain_id: uuid('brain_id').references(() => brains.id, { onDelete: 'set null' }),
  conversation_id: uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  tokens_used: integer('tokens_used'),
  model_used: varchar('model_used', { length: 100 }),
  latency_ms: integer('latency_ms'),
  error_message: text('error_message'),
  ip_address: varchar('ip_address', { length: 45 }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('request_logs_user_id_idx').on(table.user_id),
  index('request_logs_brain_id_idx').on(table.brain_id),
  index('request_logs_created_at_idx').on(table.created_at),
]);

// Type exports for convenience
export type Brain = typeof brains.$inferSelect;
export type NewBrain = typeof brains.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type DocumentSection = typeof documentSections.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type RequestLog = typeof requestLogs.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
