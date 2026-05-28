import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  // Mobile drawer state — not persisted, always starts closed on load.
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  toggleMobileDrawer: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      mobileDrawerOpen: false,
      setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
      toggleMobileDrawer: () => set((state) => ({ mobileDrawerOpen: !state.mobileDrawerOpen })),
    }),
    {
      name: 'perform-ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);

// Sidebar layout constants (desktop)
export const SIDEBAR_LEFT = 24;       // left-6
export const SIDEBAR_GAP = 22;        // gap between sidebar and content
export const SIDEBAR_EXPANDED_W = 270;
export const SIDEBAR_COLLAPSED_W = 68;

/**
 * Horizontal offset content should keep clear of the floating sidebar.
 * On mobile (drawer mode) the sidebar is overlaid, so content goes full
 * width — pass `true` to opt out of the offset entirely.
 */
export function getSidebarOffset(collapsed: boolean, isMobile = false) {
  if (isMobile) return 0;
  return SIDEBAR_LEFT + (collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W) + SIDEBAR_GAP;
}
