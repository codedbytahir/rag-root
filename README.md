# RAGroot

RAGroot is an enterprise-grade Retrieval-Augmented Generation (RAG) platform built with Next.js 15, Supabase, and LlamaIndex. It empowers users to create isolated "Brains" (knowledge bases), upload PDF documents, and interact with their data through high-precision AI with verifiable citations.

## What's New
- **Brain Settings Overhaul:** Rebuilt settings panel with live-fetched LLM model selection and custom system prompts.
- **Dynamic Model Selection:** Fetch models directly from providers (Groq) to stay up-to-date with the latest LLM releases.
- **Copy Brain ID:** Quickly copy unique identifiers for use in the Public API.
- **Performance Skeletons:** Implemented pulse skeleton loaders across the dashboard for a smoother UI experience.
- **Centralized Config:** Single source of truth for model defaults and environment configuration.
- **SEO & Accessibility:** Optimized SVG markup and improved page metadata for better search ranking.

## Features
- **Brain Management:** Create and manage multiple isolated knowledge bases.
- **System Prompts:** Customize the personality and behavior of each Brain.
- **PDF Ingestion:** Automatic vectorization and indexing of uploaded documents.
- **Public API:** Robust v1 API for integrating RAG capabilities into external applications.
- **Citation Engine:** Verifiable sources for every AI response to eliminate hallucinations.
- **Secure Auth:** Google OAuth integration via Supabase SSR.

## Getting Started

1. **Clone the repository**
2. **Install dependencies:**
   npm i
3. **Setup Environment Variables:**
   Copy .env.example to .env.local and fill in your Supabase and AI provider keys.
4. **Run the server:**
   dev

## Configuration
RAGroot uses a centralized configuration in src/lib/models.config.js. You can override defaults using these environment variables:
- DEFAULT_LLM_MODEL: Default chat model (e.g., llama-3.3-70b-versatile).
- DEFAULT_EMBEDDING_MODEL: Default embedding model (e.g., gemini-embedding-2-preview).
- DEFAULT_TEMPERATURE: Controls LLM randomness (default: 0.7).
- DEFAULT_MAX_TOKENS: Maximum response length.

## Architecture
- src/app/api/: Internal and Public (v1) API routes.
- src/app/brain/: Dynamic workspace for individual Brains.
- src/app/dashboard/: User account and brain management interface.
- src/app/utils/: Core logic for RAG, ingestion, and usage tracking.
- src/lib/: Centralized configuration and shared utilities.
