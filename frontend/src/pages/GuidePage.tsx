import { Link, useParams } from "react-router-dom";
import { getGuideBySlug } from "../content/guides";

function renderBody(body: string) {
  const blocks = body
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block, idx) => {
    // Very light “markdown-like” formatting: list items starting with "-" or "1)" stay as <p>.
    return (
      <p key={idx} style={{ lineHeight: 1.65, marginTop: 0 }}>
        {block}
      </p>
    );
  });
}

export default function GuidePage() {
  const { slug } = useParams();
  const guide = slug ? getGuideBySlug(slug) : undefined;

  if (!guide) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
        <h1>Guide introuvable</h1>
        <p>
          Le contenu demandé n’existe pas (ou a été déplacé). Retourne vers la liste des guides.
        </p>
        <Link to="/guides">Voir tous les guides</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>{guide.title}</h1>
          <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.85 }}>{guide.description}</p>
          <small style={{ opacity: 0.75 }}>Mis à jour : {guide.updatedAt}</small>
        </div>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/guides">← Guides</Link>
          <Link to="/">Scores</Link>
        </nav>
      </header>

      <main style={{ marginTop: 18 }}>{renderBody(guide.body)}</main>

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
