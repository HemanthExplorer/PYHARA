import React, { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          {/* Brand Logo */}
          <a href="/" className="logo-brand" onClick={closeMobileMenu}>
            <span className="logo-title">PYHARA</span>
            <span className="logo-tagline">Honor Tradition. Protect Nature.</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="nav-desktop" aria-label="Main Navigation">
            <a href="#collection" className="nav-link">Shop</a>
            <a href="#values" className="nav-link">Our Story</a>
            <a href="#artisans" className="nav-link">Craft &amp; Makers</a>
            <a href="#sustainability" className="nav-link">Sustainability</a>
          </nav>

          {/* Header Right Actions */}
          <div className="header-actions">
            <button className="icon-btn" aria-label="Search items" title="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <button className="icon-btn" aria-label="Shopping Cart" title="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              className="icon-btn mobile-menu-btn"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav-links">
          <a href="#collection" className="mobile-nav-link" onClick={closeMobileMenu}>Shop</a>
          <a href="#values" className="mobile-nav-link" onClick={closeMobileMenu}>Our Story</a>
          <a href="#artisans" className="mobile-nav-link" onClick={closeMobileMenu}>Craft &amp; Makers</a>
          <a href="#sustainability" className="mobile-nav-link" onClick={closeMobileMenu}>Sustainability</a>
        </nav>
        <div className="mobile-drawer-footer">
          <p>PYHARA — Honor Tradition. Protect Nature.</p>
        </div>
      </div>
    </header>
  );
}
