import { Link } from "react-router-dom";
import { teams } from "../content/teams";
import AdSlot from "../components/ads/AdSlot";
import Seo from "../components/Seo";

export default function TeamsIndexPage() {
  return (
    <div className="site-container content-page">
      <Seo
        title="Equipes de football"
        description="Decouvrez les clubs et equipes couverts par LiveFoot : historique, palmares, statistiques et resultats en direct."
        path="/teams"
      />
      <div className="content-page-header">
        <h1 className="content-page-title">Equipes de football</h1>
        <p className="content-page-desc">
          Decouvrez les clubs et equipes couverts par LiveFoot : historique, palmares et actualites.
        </p>
      </div>

      <div className="page-grid">
        <div className="page-main">
          <div className="content-grid">
            {teams.map((t) => (
              <article key={t.slug} className="content-card">
                <h2 className="content-card-title">{t.name}</h2>
                <p className="content-card-desc">{t.description}</p>
                <span className="content-card-meta">Mis a jour : {t.updatedAt}</span>
                <Link to={`/teams/${t.slug}`} className="content-card-link">
                  Voir l'equipe →
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
              <Link to="/competitions" className="sidebar-link">Competitions</Link>
              <Link to="/news" className="sidebar-link">Articles</Link>
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
