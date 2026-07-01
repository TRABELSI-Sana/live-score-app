import { Link } from "react-router-dom";
import { guides } from "../../content/guides";

export default function GuidesPreview() {
  const featured = guides.slice(0, 3);

  return (
    <section style={{ marginTop: "var(--space-xl)" }}>
      <div className="section-header">
        <h2 className="section-title">Guides populaires</h2>
        <Link to="/guides" className="section-link">Tous les guides →</Link>
      </div>
      <div className="editorial-grid">
        {featured.map((guide) => (
          <article key={guide.slug} className="editorial-card">
            <div className="editorial-card-tag">Guide</div>
            <h3 className="editorial-card-title">{guide.title}</h3>
            <p className="editorial-card-desc">{guide.description}</p>
            <Link to={`/guides/${guide.slug}`} className="editorial-card-link">
              Lire le guide →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
