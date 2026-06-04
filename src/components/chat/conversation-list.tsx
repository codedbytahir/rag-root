'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Pin, PinOff } from 'lucide-react';
import { useConversations } from '@/hooks/use-conversations';
import type { ConversationListItem } from '@/types/chat';

interface ConversationListProps {
  brainId: string;
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export function ConversationList({
  brainId,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const { conversations, loading, createConversation, deleteConversation } = useConversations({ brainId });

  const handleCreate = async () => {
    onNewConversation();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    await deleteConversation(id);
    if (activeConversationId === id) {
      onNewConversation();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/5">
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-white/20 hover:border-[#10b981] hover:bg-[#10b981]/5 text-gray-400 hover:text-white transition-all text-xs"
        >
          <Plus size={14} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {loading && conversations.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs">Loading...</div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs">No conversations yet</div>
        )}

        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-xs ${
              activeConversationId === conv.id
                ? 'bg-[#10b981]/10 border border-[#10b981]/20 text-white'
                : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            <MessageSquare size={14} className="shrink-0" />
            <span className="truncate flex-1">{conv.title || 'New Conversation'}</span>
            <button
              onClick={(e) => handleDelete(e, conv.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
