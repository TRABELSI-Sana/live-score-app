import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

type Props = {
  searchTerm: string;
  onSearch: (value: string) => void;
};

const NAV_ITEMS = [
  { to: "/", label: "Accueil" },
  { to: "/en-direct", label: "En direct" },
  { to: "/guides", label: "Guides" },
  { to: "/news", label: "Actualites" },
  { to: "/teams", label: "Equipes" },
  { to: "/competitions", label: "Competitions" },
];

export default function Navbar({ searchTerm, onSearch }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">LF</span>
          <span>LiveFoot</span>
        </Link>

        <div className="navbar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <label className="navbar-search">
          <span className="navbar-search-icon">🔍</span>
          <input
            type="search"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Recherche"
          />
        </label>

        <button
          type="button"
          className="navbar-hamburger"
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      <div className={`navbar-mobile-menu${menuOpen ? " open" : ""}`}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
        <label className="navbar-search" style={{ marginTop: 8 }}>
          <span className="navbar-search-icon">🔍</span>
          <input
            type="search"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Recherche mobile"
          />
        </label>
      </div>
    </nav>
  );
}
