import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: 'perform-ui' }
  )
);

// Sidebar layout constants
export const SIDEBAR_LEFT = 24;       // left-6
export const SIDEBAR_GAP = 22;        // gap between sidebar and content
export const SIDEBAR_EXPANDED_W = 270;
export const SIDEBAR_COLLAPSED_W = 68;

export function getSidebarOffset(collapsed: boolean) {
  return SIDEBAR_LEFT + (collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W) + SIDEBAR_GAP;
}
