'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStream } from '@/hooks/use-chat-stream';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { ChatSourcesPanel } from './chat-sources-panel';
import { ConversationList } from './conversation-list';
import { Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  brainId: string;
}

export function ChatInterface({ brainId }: ChatInterfaceProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    stop,
    sources,
    activeConversationId,
  } = useChatStream({
    brainId,
    conversationId: selectedConversationId,
  });

  // Update selected conversation when a new one is created
  useEffect(() => {
    if (activeConversationId && !selectedConversationId) {
      setSelectedConversationId(activeConversationId);
    }
  }, [activeConversationId, selectedConversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewConversation = () => {
    setSelectedConversationId(undefined);
  };

  return (
    <div className="flex h-full bg-[#050a08]">
      {/* Conversation sidebar */}
      <div className="w-64 border-r border-white/5 bg-[#0c1212] flex-shrink-0 hidden md:flex flex-col">
        <ConversationList
          brainId={brainId}
          activeConversationId={selectedConversationId || activeConversationId}
          onSelectConversation={setSelectedConversationId}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="h-14 border-b border-white/5 flex items-center px-6 bg-[#0c1212]/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#10b981]" />
            <span className="font-bold text-sm text-white">RAG Root Assistant</span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <Sparkles size={48} className="text-[#10b981] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Ask anything about your documents</h3>
              <p className="text-gray-400 text-sm">Your conversations are automatically saved</p>
            </div>
          )}
          {messages.map((message, i) => (
            <ChatMessage
              key={message.id || i}
              message={message}
              isLoading={isLoading && i === messages.length - 1 && message.role === 'assistant'}
            />
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Sources panel */}
        {sources.length > 0 && (
          <ChatSourcesPanel sources={sources} />
        )}

        {/* Input area */}
        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          onStop={stop}
        />
      </div>
    </div>
  );
}
