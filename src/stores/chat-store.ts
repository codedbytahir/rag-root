import { create } from 'zustand';
import type { ChatSource } from '@/types/chat';

interface ChatState {
  // Current chat state
  activeConversationId: string | null;
  sources: ChatSource[];
  isStreaming: boolean;

  // Actions
  setActiveConversation: (id: string | null) => void;
  setSources: (sources: ChatSource[]) => void;
  setIsStreaming: (streaming: boolean) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  sources: [],
  isStreaming: false,

  setActiveConversation: (id) => set({ activeConversationId: id }),
  setSources: (sources) => set({ sources }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  resetChat: () => set({
    activeConversationId: null,
    sources: [],
    isStreaming: false,
  }),
}));
