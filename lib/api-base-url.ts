const DEFAULT_API_BASE_URL = "/app";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const ensureLeadingSlash = (value: string) =>
  value.startsWith("/") ? value : `/${value}`;

export const getApiBaseURL = () => {
  const rawValue = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!rawValue) {
    return DEFAULT_API_BASE_URL;
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return trimTrailingSlash(rawValue);
  }

  return trimTrailingSlash(ensureLeadingSlash(rawValue));
};

export const normalizeApiPath = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseURL = getApiBaseURL();
  const normalizedPath = ensureLeadingSlash(path);

  if (baseURL === "/app" && normalizedPath.startsWith("/app/")) {
    return normalizedPath.slice(4);
  }

  return normalizedPath;
};
