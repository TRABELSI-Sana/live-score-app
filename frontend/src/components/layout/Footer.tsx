import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">LiveFoot</div>
          <p className="footer-desc">
            Scores de football en direct, resultats, classements et analyses.
            Service gratuit finance par la publicite.
          </p>
        </div>

        <div>
          <div className="footer-heading">Navigation</div>
          <div className="footer-links">
            <Link to="/" className="footer-link">Accueil</Link>
            <Link to="/en-direct" className="footer-link">En direct</Link>
            <Link to="/guides" className="footer-link">Guides</Link>
            <Link to="/news" className="footer-link">Actualites</Link>
            <Link to="/teams" className="footer-link">Equipes</Link>
            <Link to="/competitions" className="footer-link">Competitions</Link>
          </div>
        </div>

        <div>
          <div className="footer-heading">Legal</div>
          <div className="footer-links">
            <a href="/privacy.html" className="footer-link">Confidentialite</a>
            <a href="/terms.html" className="footer-link">Conditions d'utilisation</a>
            <a href="/about.html" className="footer-link">A propos</a>
            <a href="/contact.html" className="footer-link">Contact</a>
          </div>
        </div>

        <div>
          <div className="footer-heading">Publicite</div>
          <div className="footer-links">
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Politique Google Ads
            </a>
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Parametres des annonces
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; 2025-2026 LiveFoot — Tous droits reserves.</span>
        <span>livefoot.tn / livefoot.online</span>
      </div>
    </footer>
  );
}
