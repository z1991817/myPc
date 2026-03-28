import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  id?: string | number;
  username?: string;
  name?: string;
  nickname?: string;
  email?: string;
  avatar?: string | null;
  points?: number | string | null;
  credits?: number | string | null;
  balance?: number | string | null;
  coin?: number | string | null;
  coins?: number | string | null;
  score?: number | string | null;
}

interface UserState {
  user: UserProfile | null;
  token: string | null;
  setUser: (user: UserProfile) => void;
  patchUser: (user: Partial<UserProfile>) => void;
  setToken: (token: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      patchUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : { ...user },
        })),
      setToken: (token) => set({ token }),
      clearUser: () => set({ user: null, token: null }),
    }),
    {
      name: "user-storage",
    },
  ),
);
