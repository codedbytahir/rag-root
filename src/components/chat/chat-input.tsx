'use client';

import { Send, Square } from 'lucide-react';
import { FormEvent } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onStop: () => void;
}

export function ChatInput({ input, setInput, handleSubmit, isLoading, onStop }: ChatInputProps) {
  return (
    <div className="p-4 bg-[#0c1212] border-t border-white/5">
      <form onSubmit={handleSubmit} className="relative group max-w-4xl mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="w-full bg-[#161b1b] border border-white/10 rounded-xl pl-4 pr-12 py-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#10b981]/50 focus:bg-[#1a2020] transition-all"
          disabled={isLoading}
        />
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition-all"
          >
            <Square size={18} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#10b981] rounded-lg text-black hover:bg-[#0bcbcb] disabled:opacity-30 transition-all"
          >
            <Send size={18} />
          </button>
        )}
      </form>
    </div>
  );
}
