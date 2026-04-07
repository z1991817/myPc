import axios from "axios";
import { addToast } from "@heroui/toast";

import { getApiBaseURL, normalizeApiPath } from "@/lib/api-base-url";
import { useInsufficientPointsModal } from "@/store/useInsufficientPointsModal";
import { useLoginModalStore } from "@/store/useLoginModalStore";
import { useUserStore } from "@/store/useUserStore";

const request = axios.create({
  baseURL: getApiBaseURL(),
});

let lastUnauthorizedNoticeAt = 0;

request.interceptors.request.use(
  (config) => {
    if (config.url) {
      config.url = normalizeApiPath(config.url);
    }

    const token = useUserStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      const { token, clearUser } = useUserStore.getState();
      const hadToken = Boolean(token);

      clearUser();

      // 仅在已登录状态失效时统一提示并打开登录弹窗，避免误伤普通未登录请求。
      if (hadToken) {
        const now = Date.now();

        if (now - lastUnauthorizedNoticeAt > 1500) {
          lastUnauthorizedNoticeAt = now;
          addToast({
            title: "登录失效，请重新登录",
            color: "warning",
          });
        }

        useLoginModalStore.getState().openModal();
      }
    }

    if (error.response?.status === 409) {
      const message = error.response?.data?.message || "积分不足";

      useInsufficientPointsModal.getState().openModal(message);
    }

    return Promise.reject(error);
  },
);

export default request;
