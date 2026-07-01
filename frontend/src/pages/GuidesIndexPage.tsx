import { Link } from "react-router-dom";
import { guides } from "../content/guides";
import AdSlot from "../components/ads/AdSlot";

export default function GuidesIndexPage() {
  return (
    <div className="site-container content-page">
      <div className="content-page-header">
        <h1 className="content-page-title">Guides football</h1>
        <p className="content-page-desc">
          Guides editoriaux pour comprendre les regles, tactiques, formats de competitions et statistiques.
        </p>
      </div>

      <div className="page-grid">
        <div className="page-main">
          <div className="content-grid">
            {guides.map((g) => (
              <article key={g.slug} className="content-card">
                <h2 className="content-card-title">{g.title}</h2>
                <p className="content-card-desc">{g.description}</p>
                <span className="content-card-meta">Mis a jour : {g.updatedAt}</span>
                <Link to={`/guides/${g.slug}`} className="content-card-link">
                  Lire le guide →
                </Link>
              </article>
            ))}
          </div>
        </div>

        <aside className="page-sidebar">
          <AdSlot variant="sidebar" slot="8567185183" />
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Explorer</h3>
            <div className="sidebar-links">
              <Link to="/news" className="sidebar-link">Articles</Link>
              <Link to="/teams" className="sidebar-link">Equipes</Link>
              <Link to="/competitions" className="sidebar-link">Competitions</Link>
              <Link to="/en-direct" className="sidebar-link">Scores en direct</Link>
            </div>
          </div>
          <AdSlot variant="sidebar" slot="8567185183" />
        </aside>
      </div>
    </div>
  );
}
