import type { SeoFaq } from "../content/seoFaqs";

export function faqSchema(faqs: SeoFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function itemListSchema(
  baseUrl: string,
  items: { name?: string; title?: string; slug: string }[],
  pathPrefix: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name ?? item.title,
      url: `${baseUrl}${pathPrefix}/${item.slug}`,
    })),
  };
}

export function organizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LiveFoot",
    url: `${baseUrl}/`,
    logo: `${baseUrl}/og-image.png`,
  };
}
