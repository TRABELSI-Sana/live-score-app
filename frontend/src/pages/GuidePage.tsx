import { Link, useParams } from "react-router-dom";
import { getGuideBySlug } from "../content/guides";
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

export default function GuidePage() {
  const { slug } = useParams();
  const guide = slug ? getGuideBySlug(slug) : undefined;

  if (!guide) {
    return (
      <div className="site-container content-page">
        <h1 className="content-page-title">Guide introuvable</h1>
        <p>Le contenu demande n'existe pas ou a ete deplace.</p>
        <Link to="/guides">Voir tous les guides →</Link>
      </div>
    );
  }

  return (
    <div className="site-container content-page">
      <div className="content-page-header">
        <h1 className="content-page-title">{guide.title}</h1>
        <p className="content-page-desc">{guide.description}</p>
        <span className="content-page-meta">Mis a jour : {guide.updatedAt}</span>
      </div>

      <div className="page-grid">
        <div className="page-main">
          <div className="article-body">
            {renderBody(guide.body)}
          </div>
          <AdSlot variant="in-feed" slot="8567185183" />
        </div>

        <aside className="page-sidebar">
          <AdSlot variant="sidebar" slot="8567185183" />
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Guides</h3>
            <div className="sidebar-links">
              <Link to="/guides" className="sidebar-link">Tous les guides</Link>
              <Link to="/news" className="sidebar-link">Articles</Link>
              <Link to="/en-direct" className="sidebar-link">Scores en direct</Link>
            </div>
          </div>
          <AdSlot variant="sidebar" slot="8567185183" />
        </aside>
      </div>
    </div>
  );
}
