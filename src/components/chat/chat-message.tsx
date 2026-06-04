'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Loader2, FileText, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  message: {
    id?: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
    sources?: Array<{
      file_id: string;
      file_name: string;
      page_label?: string;
      score: number;
    }>;
  };
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  return (
    <div className={`flex gap-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center shrink-0 mt-1">
          <Bot size={16} className="text-[#10b981]" />
        </div>
      )}

      <div className={`max-w-[85%] flex flex-col gap-3 ${isAssistant ? 'items-start' : 'items-end'}`}>
        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
          isSystem
            ? 'bg-red-500/10 text-red-400 border border-red-500/20 w-full text-center'
            : isAssistant
              ? 'bg-[#111818] text-gray-200 border border-white/5 rounded-tl-none'
              : 'bg-[#10b981] text-black font-medium rounded-tr-none'
        }`}>
          {isAssistant ? (
            <div className="markdown-container prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#050a08] prose-pre:border prose-pre:border-white/10 prose-emerald">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content || (isLoading ? '...' : '')}
              </ReactMarkdown>
            </div>
          ) : (
            message.content
          )}

          {!message.content && isLoading && isAssistant && (
            <Loader2 size={16} className="animate-spin text-[#10b981] mt-1" />
          )}
        </div>

        {/* Sources */}
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.sources.map((src, idx) => (
              <div
                key={idx}
                title={`Score: ${(src.score * 100).toFixed(1)}%`}
                className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-help flex items-center gap-1.5"
              >
                <FileText size={10} className="text-[#10b981]" />
                <span className="max-w-[120px] truncate">{src.file_name || 'Document'}</span>
                {src.page_label && (
                  <span className="opacity-50">p.{src.page_label}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Feedback buttons for assistant messages */}
        {isAssistant && message.content && !isLoading && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
              className={`p-1 rounded hover:bg-white/10 transition-colors ${feedback === 'like' ? 'text-[#10b981]' : 'text-gray-500'}`}
            >
              <ThumbsUp size={12} />
            </button>
            <button
              onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
              className={`p-1 rounded hover:bg-white/10 transition-colors ${feedback === 'dislike' ? 'text-red-400' : 'text-gray-500'}`}
            >
              <ThumbsDown size={12} />
            </button>
          </div>
        )}
      </div>

      {!isAssistant && !isSystem && (
        <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-1">
          <User size={16} className="text-gray-300" />
        </div>
      )}
    </div>
  );
}
