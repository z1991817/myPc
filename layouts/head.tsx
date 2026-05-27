import React from "react";
import NextHead from "next/head";
import { useRouter } from "next/router";

import { siteConfig } from "@/config/site";
import {
  getAlternates,
  getCanonicalUrl,
  getPageStructuredData,
  getPageSeo,
  getSeoKeywords,
  getSeoTitle,
} from "@/lib/seo";

export const Head = () => {
  const router = useRouter();
  const pageSeo = getPageSeo(router.pathname);
  const title = getSeoTitle(router.pathname);
  const canonicalUrl = getCanonicalUrl(pageSeo.canonicalPath);
  const keywords = getSeoKeywords(router.pathname).join(", ");
  const robots = pageSeo.noindex
    ? "noindex, nofollow"
    : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
  const ogImageUrl = getCanonicalUrl(siteConfig.defaultOgImage);
  const structuredData = getPageStructuredData(router.pathname);

  return (
    <NextHead>
      <title>{title}</title>
      <meta content={pageSeo.description} name="description" />
      <meta content={keywords} name="keywords" />
      <meta content={robots} name="robots" />
      <link href={canonicalUrl} rel="canonical" />
      <meta content={title} property="og:title" />
      <meta content={pageSeo.description} property="og:description" />
      <meta content={canonicalUrl} property="og:url" />
      <meta content="website" property="og:type" />
      <meta content="zh_CN" property="og:locale" />
      <meta content={siteConfig.name} property="og:site_name" />
      <meta content={ogImageUrl} property="og:image" />
      <meta content={title} name="twitter:title" />
      <meta content={pageSeo.description} name="twitter:description" />
      <meta content="summary_large_image" name="twitter:card" />
      <meta content={ogImageUrl} name="twitter:image" />
      <link href="/favicon.ico" rel="icon" />
      {getAlternates(pageSeo.canonicalPath).map((alternate) => (
        <link
          key={alternate.hrefLang}
          href={alternate.href}
          hrefLang={alternate.hrefLang}
          rel="alternate"
        />
      ))}
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
        type="application/ld+json"
      />
    </NextHead>
  );
};
