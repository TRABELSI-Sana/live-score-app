import { Link, useParams } from "react-router-dom";
import { getBySlug } from "../content/competitions";
import AdSlot from "../components/ads/AdSlot";
import Seo from "../components/Seo";
import { getSiteBase } from "../utils/siteBase";

function renderBody(body: string) {
  const blocks = body.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, idx) => {
    if (block.startsWith("### ")) return <h3 key={idx}>{block.slice(4)}</h3>;
    if (block.startsWith("## ")) return <h2 key={idx}>{block.slice(3)}</h2>;
    if (block.startsWith("# ")) return <h1 key={idx}>{block.slice(2)}</h1>;
    return <p key={idx}>{block}</p>;
  });
}

export default function CompetitionPage() {
  const { slug } = useParams();
  const comp = slug ? getBySlug(slug) : undefined;
  const siteBase = getSiteBase();

  if (!comp) {
    return (
      <div className="site-container content-page">
        <h1 className="content-page-title">Competition introuvable</h1>
        <p>La page demandee n'existe pas ou a ete deplacee.</p>
        <Link to="/competitions">Voir toutes les competitions →</Link>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: comp.name,
    sport: "Soccer",
    url: `${siteBase}/competitions/${comp.slug}`,
    description: comp.description || `Suivez ${comp.name} en direct sur LiveFoot`,
  };

  return (
    <div className="site-container content-page">
      <Seo
        title={`${comp.name} – Resultats en direct`}
        description={comp.description || `Suivez ${comp.name} en direct : classement, resultats, calendrier et statistiques sur LiveFoot.`}
        path={`/competitions/${comp.slug}`}
        jsonLd={jsonLd}
      />

      <div className="content-page-header">
        <h1 className="content-page-title">{comp.name}</h1>
        <p className="content-page-desc">{comp.description}</p>
        <span className="content-page-meta">Mis a jour : {comp.updatedAt}</span>
      </div>

      <div className="page-grid">
        <div className="page-main">
          <div className="article-body">
            {renderBody(comp.body)}
          </div>
          <AdSlot variant="in-feed" slot="8567185183" />
        </div>

        <aside className="page-sidebar">
          <AdSlot variant="sidebar" slot="8567185183" />
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Competitions</h3>
            <div className="sidebar-links">
              <Link to="/competitions" className="sidebar-link">Toutes les competitions</Link>
              <Link to="/teams" className="sidebar-link">Equipes</Link>
              <Link to="/en-direct" className="sidebar-link">Scores en direct</Link>
            </div>
          </div>
          <AdSlot variant="sidebar" slot="8567185183" />
        </aside>
      </div>
    </div>
  );
}
