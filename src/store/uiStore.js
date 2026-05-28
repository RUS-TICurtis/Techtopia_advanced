import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set, get) => ({
      // ─── Sidebar ────────────────────────────────────────────
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setSidebarMobileOpen: (v) => set({ sidebarMobileOpen: v }),

      // ─── Theme ───────────────────────────────────────────────
      theme: 'dark',
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },

      // ─── Command Palette ─────────────────────────────────────
      commandPaletteOpen: false,
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      toggleCommandPalette: () => set(s => ({ commandPaletteOpen: !s.commandPaletteOpen })),

      // ─── Active Modal ────────────────────────────────────────
      activeModal: null, // { id, props }
      openModal: (id, props = {}) => set({ activeModal: { id, props } }),
      closeModal: () => set({ activeModal: null }),

      // ─── Global Search ───────────────────────────────────────
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSearchResults: (r) => set({ searchResults: r }),
      setIsSearching: (v) => set({ isSearching: v }),
      clearSearch: () => set({ searchQuery: '', searchResults: [], isSearching: false }),

      // ─── Notifications Panel ─────────────────────────────────
      notificationCenterOpen: false,
      setNotificationCenterOpen: (v) => set({ notificationCenterOpen: v }),
      notificationPanelOpen: false,
      toggleNotificationPanel: () => set(s => ({ notificationPanelOpen: !s.notificationPanelOpen })),
      closeNotificationPanel: () => set({ notificationPanelOpen: false }),

      // ─── Page breadcrumbs ────────────────────────────────────
      breadcrumbs: [],
      setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),

      // ─── Loading overlay ─────────────────────────────────────
      globalLoading: false,
      setGlobalLoading: (v) => set({ globalLoading: v }),

      // ─── Context menu ────────────────────────────────────────
      contextMenu: null, // { x, y, items, targetId }
      openContextMenu: (menu) => set({ contextMenu: menu }),
      closeContextMenu: () => set({ contextMenu: null }),

      // ─── Pinned Dashboard Widgets ────────────────────────────
      pinnedWidgets: ["revenue", "leads", "pipeline", "tasks"],
      setPinnedWidgets: (widgets) => set({ pinnedWidgets: widgets }),
    }),
    {
      name: 'crm_ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        pinnedWidgets: state.pinnedWidgets,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      }
    }
  )
);
