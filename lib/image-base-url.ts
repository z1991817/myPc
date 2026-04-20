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

/**
 * COS 源站域名 → CDN 域名替换映射表
 * 当后端存储的 cos_url 仍是 COS 源站域名时，前端自动替换为 CDN 加速域名，
 * 避免用户浏览器直连新加坡 COS 源站导致加载缓慢。
 */
const COS_TO_CDN_MAP: Record<string, string> = {
  // 新加坡 COS 源站 → 自定义 CDN 加速域名
  "mycloudzcq-1300106439.cos.ap-singapore.myqcloud.com": "claude.artimg.top",
  // 全球加速域名（内网用，不应出现在前端，同样替换掉）
  "mycloudzcq-1300106439.cos-internal.accelerate.tencentcos.cn":
    "claude.artimg.top",
};

/**
 * 将 COS 源站 URL 替换为 CDN 加速 URL
 * 例如：
 *   https://mycloudzcq-1300106439.cos.ap-singapore.myqcloud.com/ai/xxx.jpg
 *   → https://claude.artimg.top/ai/xxx.jpg
 */
const replaceCosWithCdn = (url: string): string => {
  for (const [cosHost, cdnHost] of Object.entries(COS_TO_CDN_MAP)) {
    if (url.includes(cosHost)) {
      return url.replace(cosHost, cdnHost);
    }
  }
  return url;
};

export const normalizeImageURL = (url: string) => {
  const normalizedUrl = url?.trim();

  if (!normalizedUrl) {
    return "";
  }

  if (/^(https?:)?\/\//i.test(normalizedUrl)) {
    // 完整 URL：先尝试将 COS 源站域名替换为 CDN 域名，再返回
    return replaceCosWithCdn(normalizedUrl);
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
