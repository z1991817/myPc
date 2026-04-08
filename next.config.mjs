/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
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
