import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  id?: string | number;
  username?: string;
  name?: string;
  nickname?: string;
  email?: string;
  avatar?: string | null;
}

interface UserState {
  user: UserProfile | null;
  token: string | null;
  setUser: (user: UserProfile) => void;
  setToken: (token: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      clearUser: () => set({ user: null, token: null }),
    }),
    {
      name: "user-storage",
    }
  )
);
