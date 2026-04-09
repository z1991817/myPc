/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // CI 流水线已单独做类型检查，构建时跳过以加速
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
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
        protocol: "https",
        hostname: "mycloudzcq-1300106439.cos.ap-singapore.myqcloud.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
  },
  i18n: {
    defaultLocale: "zh",
    locales: ["zh", "en"],
  },
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
