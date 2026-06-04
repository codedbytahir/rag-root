'use client';

import { useChat as useVercelChat } from 'ai/react';
import { useState, useCallback } from 'react';
import type { ChatSource } from '@/types/chat';

interface UseChatStreamOptions {
  brainId: string;
  conversationId?: string;
  initialMessages?: Array<{ id?: string; role: 'user' | 'assistant'; content: string }>;
}

export function useChatStream({ brainId, conversationId, initialMessages }: UseChatStreamOptions) {
  const [sources, setSources] = useState<ChatSource[]>([]);
  const [activeConversationId, setActiveConversationId] = useState(conversationId);

  const chat = useVercelChat({
    api: '/api/chat',
    body: {
      brain_id: brainId,
      conversation_id: activeConversationId,
    },
    initialMessages: (initialMessages || []).map((m, i) => ({
      id: m.id || `init-${i}`,
      role: m.role,
      content: m.content,
    })),
    onFinish: (message, options) => {
      // Extract conversation ID and sources from response headers
      // The Vercel AI SDK handles the streaming automatically
    },
    onResponse: (response) => {
      // Extract sources from response headers
      const sourcesHeader = response.headers.get('X-Sources');
      if (sourcesHeader) {
        try {
          const parsed = JSON.parse(decodeURIComponent(sourcesHeader));
          setSources(parsed);
        } catch {
          // Ignore parsing errors
        }
      }

      // Extract conversation ID from response headers
      const convId = response.headers.get('X-Conversation-Id');
      if (convId && !activeConversationId) {
        setActiveConversationId(convId);
      }
    },
  });

  const sendMessage = useCallback((content: string) => {
    chat.setInput(content);
    // The useChat hook handles form submission
  }, [chat]);

  return {
    messages: chat.messages,
    input: chat.input,
    setInput: chat.setInput,
    handleInputChange: chat.handleInputChange,
    handleSubmit: chat.handleSubmit,
    isLoading: chat.isLoading,
    stop: chat.stop,
    sources,
    activeConversationId,
    sendMessage,
  };
}
