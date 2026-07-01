import { Link } from "react-router-dom";
import { articles } from "../content/articles";
import AdSlot from "../components/ads/AdSlot";
import Seo from "../components/Seo";

export default function ArticlesIndexPage() {
  return (
    <div className="site-container content-page">
      <Seo
        title="Actualites et analyses football"
        description="Articles editoriaux pour comprendre les scores, les statistiques et les tendances du football. Analyses tactiques et decryptages."
        path="/news"
      />
      <div className="content-page-header">
        <h1 className="content-page-title">Actualites & analyses</h1>
        <p className="content-page-desc">
          Contenu editorial original pour comprendre les scores, les stats et les tendances du football.
        </p>
      </div>

      <div className="page-grid">
        <div className="page-main">
          <div className="content-grid">
            {articles.map((a) => (
              <article key={a.slug} className="content-card">
                <h2 className="content-card-title">{a.title}</h2>
                <p className="content-card-desc">{a.description}</p>
                <span className="content-card-meta">Mis a jour : {a.updatedAt}</span>
                <Link to={`/news/${a.slug}`} className="content-card-link">
                  Lire l'article →
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
              <Link to="/guides" className="sidebar-link">Guides</Link>
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
