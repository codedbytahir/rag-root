'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Sparkles, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatInterface({ brainId }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "I've analyzed your documents. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Initial empty AI message with sources array
    setMessages(prev => [...prev, { role: 'ai', content: '', sources: [] }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          brain_id: brainId
        })
      });

      if (!response.ok) throw new Error("Failed to connect to AI");

      const reader = response.body.getReader();
      const textDecoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = textDecoder.decode(value);
        accumulatedText += chunk;

        if (accumulatedText.includes('[SOURCES]')) {
          const [text, sourceJson] = accumulatedText.split('[SOURCES]');

          setMessages(prev => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            newMessages[lastIndex].content = text.trim();
            if (sourceJson) {
              try {
                newMessages[lastIndex].sources = JSON.parse(sourceJson.trim());
              } catch (e) {
                // Partial JSON, ignore until complete
              }
            }
            return newMessages;
          });
        } else {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            newMessages[lastIndex].content = accumulatedText;
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'system', content: "Error: " + error.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050a08] relative">
      <div className="h-14 border-b border-white/5 flex items-center px-6 bg-[#0c1212]/50 backdrop-blur-md shrink-0">
         <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#10b981]" />
            <span className="font-bold text-sm text-white">RAG Root Assistant</span>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center shrink-0 mt-1">
                <Bot size={16} className="text-[#10b981]" />
              </div>
            )}
            
            <div className={`max-w-[85%] flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                msg.role === 'user'
                  ? 'bg-[#10b981] text-black font-medium rounded-tr-none'
                  : msg.role === 'system'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 w-full text-center'
                  : 'bg-[#111818] text-gray-200 border border-white/5 rounded-tl-none'
              }`}>

                {/* RENDER MARKDOWN FOR AI MESSAGES */}
                {msg.role === 'ai' ? (
                  <div className="markdown-container prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#050a08] prose-pre:border prose-pre:border-white/10 prose-emerald">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content || (isLoading && i === messages.length - 1 ? '...' : '')}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}

                {!msg.content && isLoading && msg.role === 'ai' && (
                  <Loader2 size={16} className="animate-spin text-[#10b981] mt-1" />
                )}
              </div>

              {/* SOURCES LIST */}
              {msg.role === 'ai' && msg.sources?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {msg.sources.map((src, idx) => (
                    <div
                      key={idx}
                      title={src.text}
                      className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-help flex items-center gap-1.5"
                    >
                      <FileText size={10} className="text-[#10b981]" />
                      <span className="max-w-[120px] truncate">{src.metadata?.file_name || 'Document'}</span>
                      {src.metadata?.page_label && (
                        <span className="opacity-50">p.{src.metadata.page_label}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-[#0c1212] border-t border-white/5">
        <form onSubmit={handleSendMessage} className="relative group max-w-4xl mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..." 
            className="w-full bg-[#161b1b] border border-white/10 rounded-xl pl-4 pr-12 py-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#10b981]/50 focus:bg-[#1a2020] transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#10b981] rounded-lg text-black hover:bg-[#0bcbcb] disabled:opacity-30 transition-all"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}