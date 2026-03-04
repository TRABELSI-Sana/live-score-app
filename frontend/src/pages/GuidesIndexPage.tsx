import { Link } from "react-router-dom";
import { guides } from "../content/guides";

export default function GuidesIndexPage() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Guides & contenus éditoriaux</h1>
          <p style={{ marginTop: 8 }}>
            Ici, tu as du contenu “éditeur” (guides, explications, FAQ) pour compléter les scores.
          </p>
        </div>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/">← Retour aux scores</Link>
          <a href="/about.html">À propos</a>
          <a href="/privacy.html">Confidentialité</a>
          <a href="/terms.html">Conditions</a>
          <a href="/contact.html">Contact</a>
        </nav>
      </header>

      <section style={{ marginTop: 18 }}>
        <h2 style={{ marginBottom: 8 }}>Tous les guides</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {guides.map((g) => (
            <article
              key={g.slug}
              style={{ border: "1px solid rgba(0,0,0,.12)", borderRadius: 14, padding: 14 }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>
                <Link to={`/guides/${g.slug}`}>{g.title}</Link>
              </h3>
              <p style={{ marginTop: 0 }}>{g.description}</p>
              <small style={{ opacity: 0.75 }}>Mis à jour : {g.updatedAt}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
