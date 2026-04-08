import type { GetServerSideProps } from "next";

import { getIndexableSitemapEntries } from "@/lib/seo";

function buildSitemapXml() {
  const now = new Date().toISOString();
  const urls = getIndexableSitemapEntries()
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  res.write(buildSitemapXml());
  res.end();

  return {
    props: {},
  };
};

export default function SitemapXml() {
  return null;
}
