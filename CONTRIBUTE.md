# Contributing to RAG ROOT

First off, thank you for considering contributing to RAG ROOT! It's people like you that make RAG ROOT such a great tool.

## Code of Conduct

By participating in this project, you agree to abide by the terms of our Code of Conduct. (In an open-source setting, this usually links to a CODE_OF_CONDUCT.md file, but for now, we follow standard professional courtesy).

## How Can I Contribute?

### Reporting Bugs

- **Check if the bug has already been reported** by searching on GitHub under [Issues](https://github.com/your-repo/rag-root/issues).
- If you can't find an open issue addressing the problem, [open a new one](https://github.com/your-repo/rag-root/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

- **Check if the enhancement has already been suggested.**
- Open a new issue with a clear title and description of the proposed feature.

### Your First Code Contribution

1. Fork the repository.
2. Clone your fork: `git clone https://github.com/your-username/rag-root.git`
3. Create a new branch: `git checkout -b feature/my-new-feature`
4. Install dependencies: `npm install`
5. Set up your environment variables (see below).
6. Make your changes and commit them: `git commit -m "Add some feature"`
7. Push to the branch: `git push origin feature/my-new-feature`
8. Submit a pull request.

## Local Development Setup

### Prerequisites

- **Node.js**: v20 or higher (Next.js 15 requirement)
- **Supabase Account**: You'll need a Supabase project for the database and authentication.
- **Groq API Key**: For LLM inference.
- **Google AI API Key**: For Gemini embeddings.

### Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Provider Keys
GROQ_API_KEY=your_groq_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Security
ENCRYPTION_KEY=your_32_character_encryption_key
```

### Database Setup

1. Run the initial schema in `migration.sql` in your Supabase SQL Editor.
2. Apply optimizations found in `supabase_optimization.sql` to enable HNSW indexing and metadata filtering.

## Style Guide

- **JavaScript**: Use modern ES6+ syntax.
- **Next.js**: Follow the App Router conventions.
- **Tailwind CSS**: Use Tailwind CSS 4 utility classes.
- **Linting**: Run `npm run lint` before submitting a PR.
- **Commits**: Use descriptive commit messages (e.g., `feat: add PDF structure validation`, `fix: resolve auth callback loop`).

## Technical Architecture

- **Frontend**: Next.js 15 (App Router), Tailwind CSS 4, Lucide Icons.
- **Backend**: Next.js API Routes, LlamaIndex for RAG logic.
- **Database**: Supabase (PostgreSQL + pgvector).
- **Authentication**: Supabase Auth (Google OAuth).
- **Storage**: Supabase Storage for PDF files.

## Documentation

If you add a new feature, please update `blueprint.md` to reflect the changes in the project's architecture or state.
