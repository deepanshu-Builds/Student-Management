
import { useState } from "react";
import "../styles/Navbar.css";

function Navbar({ activePage, setActivePage, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const pages = ["Home", "About", "Contact"];

  const handleNavigation = (page) => {
    setActivePage(page);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Brand */}
        <button
          className="navbar-brand"
          onClick={() => handleNavigation("Home")}
          aria-label="Academia Pulse Home"
        >
          ACADEMIA PULSE
        </button>

        {/* Desktop Navigation */}
        <nav className="navbar-links">
          {pages.map((page) => (
            <button
              key={page}
              className={`navbar-link ${
                activePage === page ? "active" : ""
              }`}
              onClick={() => handleNavigation(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="navbar-link logout-link"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div className="navbar-mobile-menu">
          <button
            className="navbar-menu-toggle"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            ⋮
          </button>

          {menuOpen && (
            <div className="navbar-dropdown">
              {pages.map((page) => (
                <button
                  key={page}
                  className={`navbar-dropdown-link ${
                    activePage === page ? "active" : ""
                  }`}
                  onClick={() => handleNavigation(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="navbar-dropdown-link logout-link"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;
