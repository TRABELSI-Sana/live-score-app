import { Link, useParams } from "react-router-dom";
import { getBySlug } from "../content/articles";

function renderBody(body: string) {
  const blocks = body
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block, idx) => {
    const isHeading1 = block.startsWith("# ");
    const isHeading2 = block.startsWith("## ");
    const isHeading3 = block.startsWith("### ");
    const text = block.replace(/^#{1,3}\s+/, "");

    if (isHeading1) return <h1 key={idx} style={{ marginTop: 0 }}>{text}</h1>;
    if (isHeading2) return <h2 key={idx} style={{ marginTop: 18 }}>{text}</h2>;
    if (isHeading3) return <h3 key={idx} style={{ marginTop: 16 }}>{text}</h3>;

    return (
      <p key={idx} style={{ lineHeight: 1.7, marginTop: 0 }}>
        {block}
      </p>
    );
  });
}

export default function ArticlePage() {
  const { slug } = useParams();
  const article = slug ? getBySlug(slug) : undefined;

  if (!article) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
        <h1>Article introuvable</h1>
        <p>Cette page n’existe pas (ou a été déplacée).</p>
        <Link to="/news">Voir toutes les analyses</Link>
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
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>{article.title}</h1>
          <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.85 }}>{article.description}</p>
          <small style={{ opacity: 0.75 }}>Mis à jour : {article.updatedAt}</small>
        </div>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/news">← Articles</Link>
          <Link to="/">Scores</Link>
          <Link to="/teams">Équipes</Link>
        </nav>
      </header>

      <main style={{ marginTop: 18 }}>{renderBody(article.body)}</main>

      <footer style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid rgba(0,0,0,.12)" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/privacy.html">Politique de confidentialité</a>
          <a href="/terms.html">Conditions</a>
          <a href="/contact.html">Contact</a>
        </div>
      </footer>
    </div>
  );
}
