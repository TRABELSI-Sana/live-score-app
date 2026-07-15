import { Link } from "react-router-dom";
import { competitions } from "../content/competitions";
import AdSlot from "../components/ads/AdSlot";
import Seo from "../components/Seo";
import SeoFaqSection from "../components/SeoFaqSection";
import { competitionsFaqs } from "../content/seoFaqs";
import { faqSchema, itemListSchema } from "../utils/seoSchemas";
import { getSiteBase } from "../utils/siteBase";

export default function CompetitionsIndexPage() {
  const siteBase = getSiteBase();

  return (
    <div className="site-container content-page">
      <Seo
        title="Competitions de football"
        description="Toutes les competitions couvertes par LiveFoot : Ligue 1, Premier League, Liga, Serie A, Champions League. Format, enjeux et classements."
        path="/competitions"
        jsonLd={[
          itemListSchema(siteBase, competitions, "/competitions"),
          faqSchema(competitionsFaqs),
        ]}
      />
      <div className="content-page-header">
        <h1 className="content-page-title">Competitions de football</h1>
        <p className="content-page-desc">
          Format, enjeux et classements des principales competitions couvertes par LiveFoot.
        </p>
      </div>

      <div className="page-grid">
        <div className="page-main">
          <div className="content-grid">
            {competitions.map((c) => (
              <article key={c.slug} className="content-card">
                <h2 className="content-card-title">{c.name}</h2>
                <p className="content-card-desc">{c.description}</p>
                <span className="content-card-meta">Mis a jour : {c.updatedAt}</span>
                <Link to={`/competitions/${c.slug}`} className="content-card-link">
                  Voir la competition →
                </Link>
              </article>
            ))}
          </div>
          <SeoFaqSection faqs={competitionsFaqs} />
        </div>

        <aside className="page-sidebar">
          <AdSlot variant="sidebar" slot="8567185183" />
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Explorer</h3>
            <div className="sidebar-links">
              <Link to="/teams" className="sidebar-link">Equipes</Link>
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
