import axios from "axios";

import { useUserStore, type UserProfile } from "@/store/useUserStore";
import { useInsufficientPointsModal } from "@/store/useInsufficientPointsModal";

const POINT_KEYS = [
  "points",
  "credits",
  "balance",
  "coin",
  "coins",
  "score",
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isPointsValue = (value: unknown): value is string | number =>
  typeof value === "string" || typeof value === "number";

const extractPointsPatch = (payload: unknown): Partial<UserProfile> | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const directPatch = POINT_KEYS.reduce<Partial<UserProfile>>((acc, key) => {
    const value = payload[key];

    if (isPointsValue(value)) {
      acc[key] = value;
    }

    return acc;
  }, {});

  if (Object.keys(directPatch).length > 0) {
    return directPatch;
  }

  for (const key of ["data", "user", "profile", "result", "payload"] as const) {
    const nestedPatch = extractPointsPatch(payload[key]);

    if (nestedPatch) {
      return nestedPatch;
    }
  }

  return null;
};

// 创建 axios 实例
const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
});

// 请求拦截器：添加 token
request.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：处理错误
request.interceptors.response.use(
  (response) => {
    const pointsPatch = extractPointsPatch(response.data);

    if (pointsPatch && useUserStore.getState().user) {
      useUserStore.getState().patchUser(pointsPatch);
    }

    return response.data;
  },
  (error) => {
    // 处理 401 未授权错误
    if (error.response?.status === 401) {
      useUserStore.getState().clearUser();
    }

    // 处理 409 积分不足错误
    if (error.response?.status === 409) {
      const message = error.response?.data?.message || "积分不足";

      useInsufficientPointsModal.getState().openModal(message);
    }

    return Promise.reject(error);
  },
);

export default request;
