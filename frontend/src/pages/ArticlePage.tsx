import { Link, useParams } from "react-router-dom";
import { getBySlug } from "../content/articles";
import AdSlot from "../components/ads/AdSlot";

function renderBody(body: string) {
  const blocks = body.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  return blocks.map((block, idx) => {
    if (block.startsWith("### ")) return <h3 key={idx}>{block.slice(4)}</h3>;
    if (block.startsWith("## ")) return <h2 key={idx}>{block.slice(3)}</h2>;
    if (block.startsWith("# ")) return <h1 key={idx}>{block.slice(2)}</h1>;
    return <p key={idx}>{block}</p>;
  });
}

export default function ArticlePage() {
  const { slug } = useParams();
  const article = slug ? getBySlug(slug) : undefined;

  if (!article) {
    return (
      <div className="site-container content-page">
        <h1 className="content-page-title">Article introuvable</h1>
        <p>Cette page n'existe pas ou a ete deplacee.</p>
        <Link to="/news">Voir toutes les analyses →</Link>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    dateModified: article.updatedAt,
    datePublished: article.updatedAt,
    author: { "@type": "Organization", name: "LiveFoot" },
    publisher: { "@type": "Organization", name: "LiveFoot" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `/news/${article.slug}` },
  };

  return (
    <div className="site-container content-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="content-page-header">
        <h1 className="content-page-title">{article.title}</h1>
        <p className="content-page-desc">{article.description}</p>
        <span className="content-page-meta">Mis a jour : {article.updatedAt}</span>
      </div>

      <div className="page-grid">
        <div className="page-main">
          <div className="article-body">
            {renderBody(article.body)}
          </div>
          <AdSlot variant="in-feed" slot="8567185183" />
        </div>

        <aside className="page-sidebar">
          <AdSlot variant="sidebar" slot="8567185183" />
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Articles</h3>
            <div className="sidebar-links">
              <Link to="/news" className="sidebar-link">Tous les articles</Link>
              <Link to="/guides" className="sidebar-link">Guides</Link>
              <Link to="/en-direct" className="sidebar-link">Scores en direct</Link>
            </div>
          </div>
          <AdSlot variant="sidebar" slot="8567185183" />
        </aside>
      </div>
    </div>
  );
}
