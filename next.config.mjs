/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
