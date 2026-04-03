import type { GetServerSideProps } from "next";

import { getCanonicalUrl, getSiteUrl } from "@/lib/seo";

const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /checkout
Disallow: /login
Disallow: /my-orders
Disallow: /my-creations

Sitemap: ${getCanonicalUrl("/sitemap.xml")}
Host: ${getSiteUrl()}
`;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(robots);
  res.end();

  return {
    props: {},
  };
};

export default function RobotsTxt() {
  return null;
}
