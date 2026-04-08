const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const ensureLeadingSlash = (value: string) =>
  value.startsWith("/") ? value : `/${value}`;

export const getImageBaseURL = () => {
  const rawValue = process.env.NEXT_PUBLIC_IMAGE_BASE_URL?.trim();

  if (!rawValue) {
    return "";
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return trimTrailingSlash(rawValue);
  }

  return trimTrailingSlash(ensureLeadingSlash(rawValue));
};

export const normalizeImageURL = (url: string) => {
  const normalizedUrl = url?.trim();

  if (!normalizedUrl) {
    return "";
  }

  if (/^(https?:)?\/\//i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  if (normalizedUrl.startsWith("data:") || normalizedUrl.startsWith("blob:")) {
    return normalizedUrl;
  }

  const imageBaseURL = getImageBaseURL();

  if (!imageBaseURL) {
    return normalizedUrl;
  }

  return `${imageBaseURL}${ensureLeadingSlash(normalizedUrl)}`;
};
