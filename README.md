# RAG ROOT 🧠

RAG ROOT is an enterprise-grade Retrieval-Augmented Generation (RAG) platform built for high-precision document intelligence. Built with **Next.js 15**, **Supabase**, and **LlamaIndex**, it enables users to transform static PDFs into interactive, queryable knowledge bases with verifiable citations.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-blue?style=flat-square&logo=supabase)](https://supabase.com/)
[![LlamaIndex](https://img.shields.io/badge/LlamaIndex-RAG-orange?style=flat-square)](https://www.llamaindex.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## ✨ Features

- **Isolated "Brains":** Create multiple knowledge bases to keep your projects separated and organized.
- **Smart Ingestion:** Automated PDF processing and vectorization using Gemini embeddings.
- **High-Precision Retrieval:** Powered by HNSW indexing for sub-100ms vector search at scale.
- **Grounded AI Answers:** Real-time streaming responses with direct citations from your source documents.
- **Developer API:** Robust Public API (v1) to integrate your Brains into external applications.
- **Modern UI:** A sleek, 3D glassy dark green interface optimized for performance and UX.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase Project (with Vector extension enabled)
- Groq API Key (for LLM)
- Google AI API Key (for Embeddings)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/rag-root.git
   cd rag-root
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GROQ_API_KEY=your_groq_key
   GOOGLE_AI_API_KEY=your_google_key
   ENCRYPTION_KEY=your_32_character_encryption_key
   ```

4. **Database Setup:**
   Run the SQL provided in `migration.sql` and `supabase_optimization.sql` in your Supabase SQL Editor to set up the schema and vector indexes.

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the result.

## 🛠 Tech Stack

- **Frontend:** Next.js 15 (App Router), Tailwind CSS, Lucide Icons.
- **Backend:** Next.js Server Actions & API Routes.
- **Database/Auth:** Supabase (PostgreSQL, Vector, Auth).
- **AI/RAG:** LlamaIndex, Groq (Llama-3 LLMs), Google (Gemini Embeddings).

## 📖 Documentation

The full API documentation and integration guide are available at [`/docs`](https://rag.zumx.site/docs).

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTE.md](CONTRIBUTE.md) for guidelines on how to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the RAG ROOT Team.
