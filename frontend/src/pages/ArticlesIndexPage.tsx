import { Link } from "react-router-dom";
import { articles } from "../content/articles";

export default function ArticlesIndexPage() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Actualités & analyses</h1>
          <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.85 }}>
            Contenu éditorial original pour comprendre les scores, les stats et les tendances.
          </p>
          <small style={{ opacity: 0.75 }}>Pages mises à jour : 2026-03-04</small>
        </div>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/">Scores</Link>
          <Link to="/guides">Guides</Link>
          <Link to="/teams">Équipes</Link>
          <Link to="/competitions">Compétitions</Link>
        </nav>
      </header>

      <main style={{ marginTop: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {articles.map((a) => (
            <article key={a.slug} style={{ border: "1px solid rgba(0,0,0,.12)", borderRadius: 12, padding: 14 }}>
              <h2 style={{ marginTop: 0, fontSize: 18, lineHeight: 1.25 }}>{a.title}</h2>
              <p style={{ marginTop: 8, opacity: 0.85 }}>{a.description}</p>
              <small style={{ opacity: 0.7 }}>Mis à jour : {a.updatedAt}</small>
              <div style={{ marginTop: 10 }}>
                <Link to={`/news/${a.slug}`}>Lire l’article →</Link>
              </div>
            </article>
          ))}
        </div>
      </main>

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
