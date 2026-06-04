'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Conversation, ConversationListItem } from '@/types/chat';

interface UseConversationsOptions {
  brainId: string;
}

export function useConversations({ brainId }: UseConversationsOptions) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/conversations?brain_id=${brainId}`);
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [brainId]);

  useEffect(() => {
    if (brainId) {
      fetchConversations();
    }
  }, [brainId, fetchConversations]);

  const createConversation = useCallback(async (title?: string) => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brain_id: brainId, title }),
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    const data = await res.json();
    await fetchConversations(); // Refresh list
    return data.conversation as Conversation;
  }, [brainId, fetchConversations]);

  const deleteConversation = useCallback(async (id: string) => {
    const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete conversation');
    setConversations(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    conversations,
    loading,
    error,
    createConversation,
    deleteConversation,
    refreshConversations: fetchConversations,
  };
}
