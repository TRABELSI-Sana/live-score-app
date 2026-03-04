import { Link, useParams } from "react-router-dom";
import { getBySlug } from "../content/competitions";

function renderBody(body: string) {
  const blocks = body
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block, idx) => (
    <p key={idx} style={{ lineHeight: 1.7, marginTop: 0 }}>
      {block}
    </p>
  ));
}

export default function CompetitionPage() {
  const { slug } = useParams();
  const comp = slug ? getBySlug(slug) : undefined;

  if (!comp) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
        <h1>Compétition introuvable</h1>
        <p>Cette page n’existe pas (ou a été déplacée).</p>
        <Link to="/competitions">Voir toutes les compétitions</Link>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: comp.name,
    sport: "Soccer",
    url: `/competitions/${comp.slug}`,
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>{comp.name}</h1>
          <small style={{ opacity: 0.75 }}>Mis à jour : {comp.updatedAt}</small>
        </div>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/competitions">← Compétitions</Link>
          <Link to="/teams">Équipes</Link>
          <Link to="/">Scores</Link>
        </nav>
      </header>

      <main style={{ marginTop: 18 }}>{renderBody(comp.body)}</main>

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
