'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyBrainId({ brainId, className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(brainId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5 ${className}`}
      title="Copy Brain ID"
    >
      {copied ? (
        <>
          <Check size={12} className="text-[#10b981]" />
          <span className="text-[10px] font-bold text-[#10b981]">Copied!</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          <span className="text-[10px] font-mono tracking-tighter opacity-50">Copy ID</span>
        </>
      )}
    </button>
  );
}
