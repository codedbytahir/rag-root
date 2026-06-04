import { create } from 'zustand';

interface BrainState {
  activeBrainId: string | null;
  sidebarOpen: boolean;

  // Actions
  setActiveBrain: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useBrainStore = create<BrainState>((set) => ({
  activeBrainId: null,
  sidebarOpen: true,

  setActiveBrain: (id) => set({ activeBrainId: id }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
