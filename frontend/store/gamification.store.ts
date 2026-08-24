import { create } from 'zustand';

interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  setGamificationData: (data: Partial<GamificationState>) => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  xp: 0,
  level: 1,
  streak: 0,
  setGamificationData: (data) => set((state) => ({ ...state, ...data })),
}));
