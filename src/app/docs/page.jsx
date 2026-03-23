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

  const curlExample = `# What this does: Sends a basic query to your Brain using cURL.
curl -X POST https://rag.zumx.site/api/v1/query 
  -H "Authorization: Bearer YOUR_API_KEY" \ # Your secret key for access
  -H "Content-Type: application/json" \ # Standard header for sending JSON
  -d '{
    "query": "What are the main findings in my documents?",
    "brain_id": "YOUR_BRAIN_ID"
  }'`;

  const nodeExample = `// What this does: Sends a query to your Brain from a JavaScript application.
async function askMyBrain() {
  const response = await fetch('https://rag.zumx.site/api/v1/query', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY', // Your secret key
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: 'What are the main findings?', // The question you want to ask
      brain_id: 'YOUR_BRAIN_ID' // The specific Brain to ask
    })
  });

  const data = await response.json();
  console.log(data.answer); // Logs the answer to the console
}

askMyBrain();`;

  const responseExample = `{
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
}`;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-[#10b981] selection:text-black">
      <nav className="sticky top-0 z-50 w-full bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <Code2 className="text-[#10b981]" size={20} />
              <span className="font-bold text-lg tracking-tight text-white">API Documentation</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-16">

          {/* Header */}
          <section>
            <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Talk to Your Data, from Anywhere</h1>
            <p className="text-lg text-[#a1a1aa] max-w-2xl">
              Our API lets your applications communicate directly with your RAG Root Brains. It's like giving your own code a direct line to its own private search engine.
            </p>
          </section>

          {/* Authentication */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-[#10b981]" />
              <h2 className="text-2xl font-bold text-white">1. Authentication</h2>
            </div>
            <p className="text-[#a1a1aa] leading-relaxed">
              Think of your API key as a secret password for your code. Every request you make needs to include this key to prove it has permission to access your data.
            </p>
            <div className="bg-[#18181b] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300">
              <span className="text-gray-500"># This goes in the 'Authorization' header of your request</span><br/>
              Authorization: Bearer <span className="text-yellow-400">YOUR_API_KEY</span>
            </div>
            <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-sm text-yellow-300">
              <strong>Keep it secret, keep it safe!</strong> Never share your API key publicly or commit it to a public code repository. Treat it like you would any password.
            </div>
          </section>

          {/* Endpoint */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-[#10b981]" />
              <h2 className="text-2xl font-bold text-white">2. The Query Endpoint</h2>
            </div>
            <p className="text-[#a1a1aa] leading-relaxed">
              This is the web address (URL) where your code sends its questions. You'll always use the same endpoint, no matter which Brain you're talking to.
            </p>
            <div className="flex items-center gap-3 bg-[#18181b] border border-white/10 rounded-xl p-4">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded border border-emerald-500/20">POST</span>
              <code className="text-sm text-gray-300">https://rag.zumx.site/api/v1/query</code>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
               <h3 className="text-lg font-bold text-gray-200">What to Send (Request Body)</h3>
               <p className="text-[#a1a1aa]">Your request must be a JSON object containing two fields:</p>
               <table className="w-full text-left text-sm mt-4">
                  <thead className="bg-white/5">
                    <tr className="text-gray-400">
                      <th className="p-3 font-medium">Field</th>
                      <th className="p-3 font-medium">Analogy</th>
                      <th className="p-3 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-white/5">
                      <td className="p-3 font-mono text-[#10b981]">query</td>
                      <td className="p-3 text-gray-400">The question</td>
                      <td className="p-3">The natural language question you want to ask your documents.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-[#10b981]">brain_id</td>
                      <td className="p-3 text-gray-400">Which "brain" to ask</td>
                      <td className="p-3">Each collection of documents you upload is a "Brain". You can find its unique ID in the dashboard URL when you select it.</td>
                    </tr>
                  </tbody>
               </table>
            </div>
          </section>

          {/* Examples */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <Terminal size={20} className="text-[#10b981]" />
                <h2 className="text-2xl font-bold text-white">3. Putting It All Together</h2>
             </div>
             <p className="text-[#a1a1aa] leading-relaxed">Let's look at some real examples you can copy and paste to get started quickly.</p>
             <div className="space-y-10">
                {/* CURL */}
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <h4 className="text-lg font-bold text-gray-200">Example: cURL (for command line)</h4>
                      <button onClick={() => copyToClipboard(curlExample, 'curl')} className="text-xs flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors">
                         {copied === 'curl' ? <><Check size={14} className="text-[#10b981]" />Copied</> : <><Copy size={14} />Copy</>}
                      </button>
                   </div>
                   <pre className="bg-[#0c1212] border border-white/5 rounded-xl p-4 overflow-x-auto custom-scrollbar">
                      <code className="text-xs sm:text-sm text-gray-300 leading-relaxed font-mono">
                        {curlExample}
                      </code>
                   </pre>
                   <p className="text-xs text-gray-500 pt-2"><strong>Expected Result:</strong> You'll see a JSON object printed in your terminal containing the answer and sources.</p>
                </div>

                {/* Node.js */}
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <h4 className="text-lg font-bold text-gray-200">Example: JavaScript (for web apps)</h4>
                      <button onClick={() => copyToClipboard(nodeExample, 'node')} className="text-xs flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors">
                         {copied === 'node' ? <><Check size={14} className="text-[#10b981]" />Copied</> : <><Copy size={14} />Copy</>}
                      </button>
                   </div>
                   <pre className="bg-[#0c1212] border border-white/5 rounded-xl p-4 overflow-x-auto custom-scrollbar">
                      <code className="text-xs sm:text-sm text-gray-300 leading-relaxed font-mono">
                        {nodeExample}
                      </code>
                   </pre>
                   <p className="text-xs text-gray-500 pt-2"><strong>Expected Result:</strong> The answer from your Brain will be printed in the developer console.</p>
                </div>

                <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-sm text-red-300 space-y-2">
                    <p className="font-bold">If something goes wrong:</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                        <li>A <strong className="text-red-400">401 Unauthorized</strong> error means your API key is wrong or missing.</li>
                        <li>A <strong className="text-red-400">404 Not Found</strong> error often means the `brain_id` is incorrect.</li>
                        <li>A <strong className="text-red-400">500 Server Error</strong> means something went wrong on our end. Please wait a moment and try again.</li>
                    </ul>
                </div>
             </div>
          </section>

          {/* Response Format */}
          <section className="space-y-6">
             <h2 className="text-2xl font-bold text-white">4. Understanding the Response</h2>
              <p className="text-[#a1a1aa] leading-relaxed">
                After you ask a question, the API gives you back a JSON object. Think of it as an organized package of information containing the answer and proof of where it came from.
             </p>
             <pre className="bg-[#18181b] border border-white/10 rounded-xl p-4 overflow-x-auto">
                <code className="text-sm text-gray-300 font-mono">
                  {responseExample}
                </code>
             </pre>
             <div className="mt-4 text-xs text-gray-400">
                <p><strong className="text-[#10b981]">"answer":</strong> The direct answer to your question.</p>
                <p className="mt-1"><strong className="text-[#10b981]">"sources":</strong> A list of the exact document snippets the AI used to create the answer, giving you full transparency.</p>
             </div>
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
