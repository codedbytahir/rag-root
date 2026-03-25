'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Code2, Copy, Check, Terminal, Globe, Lock } from 'lucide-react';
import { useState } from 'react';

export default function ApiDocs() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const curlExample = `curl -X POST https://rag-root.vercel.app/api/v1/query \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "What are the main findings in my documents?",
    "brain_id": "YOUR_BRAIN_ID"
  }'`;

  const nodeExample = `const response = await fetch('https://rag-root.vercel.app/api/v1/query', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'What are the main findings?',
    brain_id: 'YOUR_BRAIN_ID'
  })
});

const data = await response.json();
console.log(data.answer);`;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-[#10b981] selection:text-black">
      <nav className="sticky top-0 z-50 w-full bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-3">
              <Code2 className="text-[#10b981]" size={20} />
              <span className="font-bold text-lg tracking-tight text-white">API Documentation</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">

          {/* Header */}
          <section>
            <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Integrate RAG Root into your Apps</h1>
            <p className="text-lg text-[#a1a1aa] max-w-2xl">
              Use our robust API to query your knowledge bases programmatically. Perfect for building custom chatbots, automated reports, or internal tools.
            </p>
          </section>

          {/* Authentication */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#10b981]">
              <Lock size={20} />
              <h2 className="text-xl font-bold text-white">Authentication</h2>
            </div>
            <p className="text-[#a1a1aa]">
              All API requests must include your secret API key in the <code className="bg-white/5 px-1.5 py-0.5 rounded text-white">Authorization</code> header as a Bearer token.
            </p>
            <div className="bg-[#18181b] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300">
              Authorization: Bearer rr_live_...
            </div>
          </section>

          {/* Endpoint */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#10b981]">
              <Globe size={20} />
              <h2 className="text-xl font-bold text-white">Query Endpoint</h2>
            </div>
            <p className="text-[#a1a1aa]">
              Send a POST request to the following endpoint to interact with a specific brain.
            </p>
            <div className="flex items-center gap-3 bg-[#18181b] border border-white/10 rounded-xl p-4">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded border border-emerald-500/20">POST</span>
              <code className="text-sm text-gray-300">https://rag-root.vercel.app/api/v1/query</code>
            </div>

            <div className="mt-6 space-y-4">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Request Body</h3>
               <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500">
                      <th className="pb-2 font-medium">Field</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-white/5">
                      <td className="py-3 font-mono text-[#10b981]">query</td>
                      <td className="py-3 text-gray-500">string</td>
                      <td className="py-3">The natural language question you want to ask.</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-mono text-[#10b981]">brain_id</td>
                      <td className="py-3 text-gray-500">uuid</td>
                      <td className="py-3">The unique identifier of the brain (found in URL).</td>
                    </tr>
                  </tbody>
               </table>
            </div>
          </section>

          {/* Examples */}
          <section className="space-y-6">
             <div className="flex items-center gap-2 text-[#10b981]">
                <Terminal size={20} />
                <h2 className="text-xl font-bold text-white">Implementation Examples</h2>
             </div>

             <div className="space-y-8">
                {/* CURL */}
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-400">cURL</h4>
                      <button
                        onClick={() => copyToClipboard(curlExample, 'curl')}
                        className="text-xs flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors"
                      >
                         {copied === 'curl' ? <Check size={14} className="text-[#10b981]" /> : <Copy size={14} />}
                         {copied === 'curl' ? 'Copied' : 'Copy code'}
                      </button>
                   </div>
                   <pre className="bg-[#0c1212] border border-white/5 rounded-xl p-5 overflow-x-auto custom-scrollbar">
                      <code className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {curlExample}
                      </code>
                   </pre>
                </div>

                {/* Node.js */}
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-400">JavaScript (Fetch)</h4>
                      <button
                        onClick={() => copyToClipboard(nodeExample, 'node')}
                        className="text-xs flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors"
                      >
                         {copied === 'node' ? <Check size={14} className="text-[#10b981]" /> : <Copy size={14} />}
                         {copied === 'node' ? 'Copied' : 'Copy code'}
                      </button>
                   </div>
                   <pre className="bg-[#0c1212] border border-white/5 rounded-xl p-5 overflow-x-auto custom-scrollbar">
                      <code className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {nodeExample}
                      </code>
                   </pre>
                </div>
             </div>
          </section>

          {/* Response Format */}
          <section className="space-y-4">
             <h2 className="text-xl font-bold text-white">Response Format</h2>
             <p className="text-[#a1a1aa]">
                The API returns a JSON object containing the grounded answer and the sources used for retrieval.
             </p>
             <pre className="bg-[#18181b] border border-white/10 rounded-xl p-5 overflow-x-auto">
                <code className="text-sm text-[#10b981]">
{`{
  "answer": "The quarterly revenue grew by 15%...",
  "sources": [
    {
      "file_name": "Report_2024.pdf",
      "page_label": "4",
      "text_snippet": "Revenue in Q3 reached...",
      "score": 0.89
    }
  ],
  "brain_id": "...",
  "created_at": "2024-..."
}`}
                </code>
             </pre>
          </section>

        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </div>
  );
}
