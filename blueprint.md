# RAG ROOT - Project Blueprint

## Project Overview
RAG ROOT is an enterprise-grade RAG (Retrieval-Augmented Generation) application built with Next.js 15, Supabase, and LlamaIndex. It allows users to create "Brains" (knowledge bases), upload PDF documents, and query them using AI with verifiable citations.

## Core Features
- **Auth & Profile:** Secure Google Login via Supabase SSR.
- **Brain Management:** Create and manage multiple isolated knowledge bases.
- **File Ingestion:** PDF structure validation and vectorized storage using Gemini embeddings.
- **RAG Engine:** High-precision retrieval using Supabase Vector Store and Groq LLMs.
- **API Platform:** Public API endpoint for external developers with secure key management.
- **UI/UX:** Modern, dark-themed interface with real-time streaming and markdown support.

## Security Architecture
- **Bearer Token Auth:** SHA-256 hashed API keys for secure public access.
- **Resource Ownership:** Strict checks across all API routes to prevent cross-user data leaks.
- **RLS Policies:** Supabase Row Level Security enforced at the database layer.

## Implementation Audit (completed)
1. **Auth Flow:** [VERIFIED]
2. **Brain Dashboard:** [VERIFIED]
3. **PDF Pipeline:** [VERIFIED]
4. **Dynamic Ingest:** [VERIFIED]
5. **Vector Search:** [VERIFIED]
6. **AI Streaming:** [VERIFIED]
7. **Key Management:** [VERIFIED]
8. **Public API v1:** [VERIFIED]
9. **UI Citations:** [VERIFIED]

## Latest Changes (Audit & Fixes)
- Refactored `/api/ingest` and `/api/retrieve` to use dynamic imports.
- Implemented Source/Citation logic in the RAG pipeline.
- Added citation display in `ChatInterface`.
- Secured all internal API routes with robust ownership verification.
- Created API Documentation page at `/dashboard/docs`.
- Fixed security gap in document deletion logic.
