import type { SeoFaq } from "../content/seoFaqs";

interface SeoFaqSectionProps {
  title?: string;
  faqs: SeoFaq[];
}

export default function SeoFaqSection({ title = "Questions frequentes", faqs }: SeoFaqSectionProps) {
  return (
    <section className="seo-faq">
      <h2>{title}</h2>
      <div className="seo-faq-list">
        {faqs.map((faq) => (
          <article key={faq.question} className="seo-faq-item">
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
