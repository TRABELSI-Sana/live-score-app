export interface ContentItem {
  slug: string;
  title?: string;
  name?: string;
  description?: string;
  updatedAt: string;
  body: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
  body: string;
}

export interface SeoFaq {
  question: string;
  answer: string;
}
