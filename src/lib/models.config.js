// src/lib/models.config.js
// ─────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for all model defaults
// Change here → changes everywhere
// ─────────────────────────────────────────────

export const MODEL_DEFAULTS = {
  // Default LLM used for chat/completion when user has not selected one
  DEFAULT_LLM: process.env.DEFAULT_LLM_MODEL || "llama-3.3-70b-versatile",

  // Default embedding model used when creating a new brain
  DEFAULT_EMBEDDING_MODEL: process.env.DEFAULT_EMBEDDING_MODEL || "gemini-embedding-2-preview",

  // Default LLM temperature
  DEFAULT_TEMPERATURE: parseFloat(process.env.DEFAULT_TEMPERATURE || "0.7"),

  // Maximum tokens for LLM response
  DEFAULT_MAX_TOKENS: parseInt(process.env.DEFAULT_MAX_TOKENS || "1024"),
}

// Per-user/per-brain model: loaded from database
// Use MODEL_DEFAULTS.DEFAULT_LLM as fallback if user has not selected one
export function resolveModel(userSelectedModel) {
  return userSelectedModel || MODEL_DEFAULTS.DEFAULT_LLM
}
