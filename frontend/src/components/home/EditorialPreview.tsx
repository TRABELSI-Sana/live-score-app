import { Link } from "react-router-dom";
import { articles } from "../../content/articles";

export default function EditorialPreview() {
  const latest = articles.slice(0, 3);

  return (
    <section style={{ marginTop: "var(--space-xl)" }}>
      <div className="section-header">
        <h2 className="section-title">A la une</h2>
        <Link to="/news" className="section-link">Voir tout →</Link>
      </div>
      <div className="editorial-grid">
        {latest.map((article) => (
          <article key={article.slug} className="editorial-card">
            <div className="editorial-card-tag">Article</div>
            <h3 className="editorial-card-title">{article.title}</h3>
            <p className="editorial-card-desc">{article.description}</p>
            <Link to={`/news/${article.slug}`} className="editorial-card-link">
              Lire →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
