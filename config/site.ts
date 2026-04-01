export type SiteConfig = typeof siteConfig;

const envSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
  process.env.VERCEL_URL?.trim();

const normalizedSiteUrl = envSiteUrl
  ? `https://${envSiteUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`
  : "https://artimg.top";

export const siteConfig = {
  name: "ArtImg",
  description:
    "ArtImg 是基于 Gemini 3.1 Flash Image 的免费 AI 图片生成器，支持 4K 写实人像、动漫插画、Logo 设计、30+ 语言文字渲染、角色一致性、批量生成与商业授权。",
  siteUrl: normalizedSiteUrl,
  defaultLocale: "zh",
  locales: ["zh", "en"],
  defaultOgImage: "/image/artimg-icon.svg",
  defaultKeywords: [
    "AI图片生成",
    "AI图像生成器",
    "免费AI图片生成器",
    "在线AI图片生成器",
    "Nano Banana 2",
    "Gemini 3.1 Flash Image",
    "4K写实人像生成",
    "动漫插画生成",
    "AI Logo生成",
    "角色一致性生成",
    "批量AI出图",
    "商业授权AI绘图",
  ],
  organization: {
    name: "ArtImg",
    logo: "/image/artimg-icon.svg",
  },
  navItems: [
    {
      label: "首页",
      href: "/",
    },
    {
      label: "画廊",
      href: "/gallery",
    },
    {
      label: "价格",
      href: "/pricing",
    },
    {
      label: "收银台",
      href: "/checkout",
    },
    {
      label: "我的创作",
      href: "/my-creations",
    },
    {
      label: "关于",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
