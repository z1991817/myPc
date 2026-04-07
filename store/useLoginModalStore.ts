import { create } from "zustand";

interface LoginModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

/**
 * 全局登录弹窗状态
 * 用于在接口鉴权失效时，从任意位置统一拉起登录弹窗。
 */
export const useLoginModalStore = create<LoginModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
