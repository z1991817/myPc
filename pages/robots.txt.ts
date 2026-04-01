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
  res.setHeader("Content-Type", "text/plain");
  res.write(robots);
  res.end();

  return {
    props: {},
  };
};

export default function RobotsTxt() {
  return null;
}
