import { Helmet } from "react-helmet-async";
import { getAlternateSiteBase, getSiteBase } from "../utils/siteBase";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  jsonLd?: object;
  breadcrumbs?: { name: string; path: string }[];
}

export default function Seo({ title, description, path, type = "website", jsonLd, breadcrumbs }: SeoProps) {
  const base = getSiteBase();
  const alternate = getAlternateSiteBase();
  const url = `${base}${path}`;
  const altUrl = `${alternate}${path}`;
  const fullTitle = `${title} | LiveFoot`;
  const ogImage = `${base}/og-image.png`;

  const breadcrumbLd = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  } : null;

  return (
    <Helmet>
      <html lang="fr" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
      <link rel="alternate" href={url} hrefLang={base.endsWith(".online") ? "fr" : "fr-TN"} />
      <link rel="alternate" href={altUrl} hrefLang={base.endsWith(".online") ? "fr-TN" : "fr"} />
      <link rel="alternate" href={`https://livefoot.online${path}`} hrefLang="x-default" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="fr_FR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
      {breadcrumbLd && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      )}
    </Helmet>
  );
}
