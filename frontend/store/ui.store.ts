import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  teacherMobileOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleTeacherMobile: () => void;
  setTeacherMobileOpen: (isOpen: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  teacherMobileOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  toggleTeacherMobile: () => set((state) => ({ teacherMobileOpen: !state.teacherMobileOpen })),
  setTeacherMobileOpen: (isOpen) => set({ teacherMobileOpen: isOpen }),
}));
