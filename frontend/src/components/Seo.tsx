import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  jsonLd?: object;
}

const BASE_ONLINE = "https://livefoot.online";
const BASE_TN = "https://livefoot.tn";

function getBase() {
  if (typeof window !== "undefined" && window.location.hostname.endsWith(".tn")) {
    return BASE_TN;
  }
  return BASE_ONLINE;
}

function getAlternate() {
  if (typeof window !== "undefined" && window.location.hostname.endsWith(".tn")) {
    return BASE_ONLINE;
  }
  return BASE_TN;
}

export default function Seo({ title, description, path, type = "website", jsonLd }: SeoProps) {
  const base = getBase();
  const alternate = getAlternate();
  const url = `${base}${path}`;
  const altUrl = `${alternate}${path}`;
  const fullTitle = `${title} | LiveFoot`;
  const ogImage = `${base}/og-image.svg`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <link rel="alternate" href={altUrl} hrefLang={base === BASE_ONLINE ? "fr-TN" : "fr"} />
      <link rel="alternate" href={url} hrefLang={base === BASE_ONLINE ? "fr" : "fr-TN"} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="fr_FR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
