import axios from "axios";

import { getApiBaseURL, normalizeApiPath } from "@/lib/api-base-url";
import { useInsufficientPointsModal } from "@/store/useInsufficientPointsModal";
import { useUserStore, type UserProfile } from "@/store/useUserStore";

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

  if (isPointsValue(payload.currentPoints)) {
    return { points: payload.currentPoints };
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
    const pointsPatch = extractPointsPatch(response.data);

    if (pointsPatch && useUserStore.getState().user) {
      useUserStore.getState().patchUser(pointsPatch);
    }

    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      useUserStore.getState().clearUser();
    }

    if (error.response?.status === 409) {
      const message = error.response?.data?.message || "积分不足";

      useInsufficientPointsModal.getState().openModal(message);
    }

    return Promise.reject(error);
  },
);

export default request;
