import { Link, useParams } from "react-router-dom";
import { getBySlug } from "../content/teams";
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

export default function TeamPage() {
  const { slug } = useParams();
  const team = slug ? getBySlug(slug) : undefined;

  if (!team) {
    return (
      <div className="site-container content-page">
        <h1 className="content-page-title">Equipe introuvable</h1>
        <p>La page demandee n'existe pas ou a ete deplacee.</p>
        <Link to="/teams">Voir toutes les equipes →</Link>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    sport: "Soccer",
    url: `/teams/${team.slug}`,
  };

  return (
    <div className="site-container content-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="content-page-header">
        <h1 className="content-page-title">{team.name}</h1>
        <p className="content-page-desc">{team.description}</p>
        <span className="content-page-meta">Mis a jour : {team.updatedAt}</span>
      </div>

      <div className="page-grid">
        <div className="page-main">
          <div className="article-body">
            {renderBody(team.body)}
          </div>
          <AdSlot variant="in-feed" slot="8567185183" />
        </div>

        <aside className="page-sidebar">
          <AdSlot variant="sidebar" slot="8567185183" />
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Equipes</h3>
            <div className="sidebar-links">
              <Link to="/teams" className="sidebar-link">Toutes les equipes</Link>
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
