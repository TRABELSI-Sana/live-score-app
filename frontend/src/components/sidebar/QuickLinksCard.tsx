import { Link } from "react-router-dom";

const LINKS = [
  { to: "/en-direct", label: "Scores en direct" },
  { to: "/guides", label: "Guides football" },
  { to: "/news", label: "Actualites & analyses" },
  { to: "/teams", label: "Equipes" },
  { to: "/competitions", label: "Competitions" },
];

const LEGAL_LINKS = [
  { href: "/about.html", label: "A propos" },
  { href: "/privacy.html", label: "Confidentialite" },
  { href: "/terms.html", label: "Conditions" },
  { href: "/contact.html", label: "Contact" },
];

export default function QuickLinksCard() {
  return (
    <div className="sidebar-card">
      <h3 className="sidebar-card-title">Acces rapide</h3>
      <div className="sidebar-links">
        {LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="sidebar-link">
            {link.label}
          </Link>
        ))}
      </div>
      <div className="sidebar-links" style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--color-border-light)" }}>
        {LEGAL_LINKS.map((link) => (
          <a key={link.href} href={link.href} className="sidebar-link">
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
