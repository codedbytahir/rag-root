# RAG ROOT

**Enterprise-grade Retrieval-Augmented Generation (RAG) platform built with Next.js 15, Supabase, and LlamaIndex.**

RAG ROOT allows users to create isolated "Brains" (knowledge bases) from PDF documents and query them using state-of-the-art AI with verifiable, source-backed citations.

## 🚀 Key Features

-   **🧠 Brain Management**: Create and manage multiple knowledge bases with full isolation.
-   **📄 Document Ingestion**: Advanced PDF structure validation and chunking.
-   **⚡ High-Precision Retrieval**: Built-in vector search powered by Gemini embeddings and Groq LLMs.
-   **🔗 API Platform**: Public API v1 for developers to integrate RAG capabilities into their own apps.
-   **🔒 Secure by Design**: Row-Level Security (RLS), Bearer Token Auth, and AES-256 encryption for provider keys.
-   **🎨 3D Glassy UI**: Modern, high-performance interface with real-time streaming and markdown rendering.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **AI Engine**: [LlamaIndex](https://www.llamaindex.ai/)
-   **Database**: [Supabase](https://supabase.com/) (PostgreSQL + `pgvector`)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **LLMs**: [Groq](https://groq.com/) (Llama 3)
-   **Embeddings**: [Google Gemini](https://ai.google.dev/) (`text-embedding-004`)

## 🏁 Getting Started

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/rag-root.git
   cd rag-root
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your credentials.
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTE.md](CONTRIBUTE.md) for details on our code of conduct and the process for submitting pull requests.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details (coming soon).

---

*Powered by RAG ROOT - Your Knowledge, Augmented.*
