/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // CI 流水线已单独做类型检查，构建时跳过以加速
    ignoreBuildErrors: true,
  },

  // ============================================================
  // 性能优化：压缩 & 编译
  // ============================================================
  compress: true, // 启用 gzip 压缩（生产环境）

  // ============================================================
  // 图片优化配置
  // ============================================================
  images: {
    // 优先 webp，avif 编码耗时较长，对服务器压力大
    formats: ["image/webp", "image/avif"],
    // 图片缓存时间：7天（默认60秒太短）
    minimumCacheTTL: 60 * 60 * 24 * 7,
    // 设备像素比，减少不必要的超高分辨率图片
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "claude.artimg.top",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // 新加坡 COS 源站（保留兼容旧数据）
        protocol: "https",
        hostname: "mycloudzcq-1300106439.cos.ap-singapore.myqcloud.com",
      },
      {
        // COS 默认 CDN 加速域名（不需要备案，国内有缓存节点，速度更快）
        // 在腾讯云 COS 控制台 → 域名与传输 → 默认 CDN 加速域名 → 开启后自动生成
        protocol: "https",
        hostname: "mycloudzcq-1300106439.file.myqcloud.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
  },

  // ============================================================
  // 国际化
  // ============================================================
  i18n: {
    defaultLocale: "zh",
    locales: ["zh", "en"],
  },

  // ============================================================
  // HTTP 响应头：缓存静态资源
  // ============================================================
  async headers() {
    return [
      {
        // Next.js 静态资源（带 hash）永久缓存
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // 字体文件永久缓存
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ============================================================
  // API 代理
  // ============================================================
  async rewrites() {
    const apiProxyTarget = process.env.API_PROXY_TARGET?.trim();

    if (!apiProxyTarget) {
      return [];
    }

    const normalizedTarget = apiProxyTarget.replace(/\/+$/, "");

    return [
      {
        source: "/app/:path*",
        destination: `${normalizedTarget}/app/:path*`,
      },
    ];
  },
};

export default nextConfig;
