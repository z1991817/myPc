import axios from "axios";

import { getApiBaseURL, normalizeApiPath } from "@/lib/api-base-url";
import { useInsufficientPointsModal } from "@/store/useInsufficientPointsModal";
import { useUserStore } from "@/store/useUserStore";

const request = axios.create({
  baseURL: getApiBaseURL(),
});

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
      useUserStore.getState().clearUser();
    }

    if (error.response?.status === 409) {
      const message = error.response?.data?.message || "绉垎涓嶈冻";

      useInsufficientPointsModal.getState().openModal(message);
    }

    return Promise.reject(error);
  },
);

export default request;

