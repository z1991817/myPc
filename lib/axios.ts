import axios from "axios";

import { getApiBaseURL, normalizeApiPath } from "@/lib/api-base-url";

const axiosInstance = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url) {
      config.url = normalizeApiPath(config.url);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
);

export default axiosInstance;
