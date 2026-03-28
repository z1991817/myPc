import { create } from "zustand";

/**
 * 积分不足模态框状态管理
 */
interface InsufficientPointsModalStore {
  isOpen: boolean;
  message: string;
  openModal: (message?: string) => void;
  closeModal: () => void;
}

export const useInsufficientPointsModal = create<InsufficientPointsModalStore>(
  (set) => ({
    isOpen: false,
    message: "积分不足",
    openModal: (message = "积分不足") => set({ isOpen: true, message }),
    closeModal: () => set({ isOpen: false }),
  }),
);
