import { siteConfig } from "@/config/site";

export type SeoMeta = {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string[];
  noindex?: boolean;
};

const pageSeoByPathname: Record<string, SeoMeta> = {
  "/": {
    title: "AI图像生成器 - 专业智能绘画平台 | Nano banana图像生成器",
    description: siteConfig.description,
    keywords: siteConfig.defaultKeywords,
    canonicalPath: "/",
  },
  "/gallery": {
    title: "AI 图片作品画廊",
    description:
      "浏览 ArtImg AI 图片作品画廊，查看 4K 写实人像、动漫插画、商品主图、海报视觉、多语言文字图像与角色一致性生成案例。",
    keywords: [
      "AI图片案例",
      "AI图片画廊",
      "AI人像作品",
      "动漫插画案例",
      "AI商品图",
      "AI海报设计",
    ],
    canonicalPath: "/gallery",
  },
  "/create": {
    title: "AI图像生成器 - 专业智能绘画平台 | Nano banana图像生成器",
    description:
      "使用 ArtImg 在线生成 AI 图片，支持写实人像、动漫插画、Logo 设计、商业视觉、多语言文字排版、批量生成与商用授权。",
    keywords: [
      "在线AI图片生成器",
      "AI绘图工具",
      "AI图像创作",
      "AI海报生成",
      "AI logo设计",
      "AI角色一致性",
    ],
    canonicalPath: "/create",
  },
  "/pricing": {
    title: "价格方案",
    description:
      "查看 ArtImg Nano Banana 2 的价格方案、积分权益与商用能力，选择适合个人创作、团队出图和高频批量生产的套餐。",
    keywords: ["AI图片生成价格", "AI绘图套餐", "AI生成积分", "商业AI绘图方案"],
    canonicalPath: "/pricing",
  },
  "/about": {
    title: "关于 ArtImg",
    description:
      "了解 ArtImg 的产品定位、核心模型能力与应用场景，涵盖 AI 图片生成、角色一致性、多语言文字渲染和商业视觉创作。",
    keywords: [
      "关于ArtImg",
      "AI图片生成平台",
      "Nano Banana 2平台",
      "AI视觉创作工具",
    ],
    canonicalPath: "/about",
  },
  "/blog": {
    title: "AI 图像生成博客",
    description:
      "阅读 ArtImg AI 图像生成博客，获取提示词技巧、角色一致性工作流、商业设计案例、AI 出图策略与实战教程。",
    keywords: ["AI绘图教程", "AI图片生成博客", "提示词技巧", "角色一致性教程"],
    canonicalPath: "/blog",
  },
  "/login": {
    title: "登录",
    description: "登录 ArtImg 账户以管理创作、订单与积分。",
    canonicalPath: "/login",
    noindex: true,
  },
  "/checkout": {
    title: "收银台",
    description: "完成 ArtImg 套餐购买与积分充值。",
    canonicalPath: "/checkout",
    noindex: true,
  },
  "/my-orders": {
    title: "我的订单",
    description: "查看 ArtImg 账户订单与充值记录。",
    canonicalPath: "/my-orders",
    noindex: true,
  },
  "/my-creations": {
    title: "我的创作",
    description: "管理 ArtImg 账户中的 AI 图像创作记录。",
    canonicalPath: "/my-creations",
    noindex: true,
  },
};

const indexablePaths = Object.values(pageSeoByPathname)
  .filter((meta) => !meta.noindex)
  .map((meta) => meta.canonicalPath);

export function getSiteUrl() {
  return siteConfig.siteUrl.replace(/\/+$/, "");
}

export function getCanonicalUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getSiteUrl()}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function getPageSeo(pathname: string): SeoMeta {
  return (
    pageSeoByPathname[pathname] || {
      title: siteConfig.name,
      description: siteConfig.description,
      canonicalPath: pathname === "/" ? "/" : pathname,
      noindex: true,
    }
  );
}

export function getSeoTitle(pathname: string) {
  const meta = getPageSeo(pathname);

  return meta.title === siteConfig.name || meta.title.includes("|")
    ? meta.title
    : `${meta.title} | ${siteConfig.name}`;
}

export function getSeoKeywords(pathname: string) {
  const meta = getPageSeo(pathname);

  return meta.keywords?.length ? meta.keywords : siteConfig.defaultKeywords;
}

export function getAlternates(path: string) {
  const normalizedPath = path === "/" ? "" : path;

  return [
    {
      hrefLang: "zh-CN",
      href: `${getSiteUrl()}${normalizedPath}`,
    },
    {
      hrefLang: "en",
      href: `${getSiteUrl()}/en${normalizedPath}`,
    },
    {
      hrefLang: "x-default",
      href: `${getSiteUrl()}${normalizedPath}`,
    },
  ];
}

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.organization.name,
    url: getSiteUrl(),
    logo: getCanonicalUrl(siteConfig.organization.logo),
  };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: getSiteUrl(),
    description: siteConfig.description,
    inLanguage: ["zh-CN", "en"],
  };
}

export function getIndexableSitemapEntries() {
  return indexablePaths.map((path) => ({
    loc: getCanonicalUrl(path),
    changefreq: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? "1.0" : path === "/pricing" ? "0.9" : "0.8",
  }));
}
