import { Link } from "react-router-dom";
import { competitions } from "../content/competitions";

export default function CompetitionsIndexPage() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Compétitions</h1>
          <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.85 }}>
            Contexte éditorial: format, enjeux, et lecture des classements.
          </p>
        </div>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/">Scores</Link>
          <Link to="/news">Articles</Link>
          <Link to="/teams">Équipes</Link>
        </nav>
      </header>

      <main style={{ marginTop: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {competitions.map((c) => (
            <article key={c.slug} style={{ border: "1px solid rgba(0,0,0,.12)", borderRadius: 12, padding: 14 }}>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>{c.name}</h2>
              <small style={{ opacity: 0.7 }}>Mis à jour : {c.updatedAt}</small>
              <div style={{ marginTop: 10 }}>
                <Link to={`/competitions/${c.slug}`}>Voir la page →</Link>
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
