'use client';

import { FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { ChatSource } from '@/types/chat';

interface ChatSourcesPanelProps {
  sources: ChatSource[];
}

export function ChatSourcesPanel({ sources }: ChatSourcesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="border-t border-white/5 bg-[#0c1212]/80 backdrop-blur-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between text-xs text-gray-400 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <FileText size={14} className="text-[#10b981]" />
          {sources.length} Source{sources.length !== 1 ? 's' : ''}
        </span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 space-y-2">
          {sources.map((source, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs"
            >
              <div className="w-5 h-5 rounded bg-[#10b981]/10 flex items-center justify-center text-[#10b981] font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white truncate">{source.file_name}</span>
                  {source.page_label && (
                    <span className="text-gray-500">p.{source.page_label}</span>
                  )}
                </div>
                <p className="text-gray-400 line-clamp-2">{source.text_snippet}</p>
                <div className="mt-1 text-gray-500">
                  Relevance: {(source.score * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
