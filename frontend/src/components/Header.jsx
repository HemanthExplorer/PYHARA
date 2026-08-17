import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openSearch, openCart, totalCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleSectionLink = (sectionId, e) => {
    e.preventDefault();
    closeMobileMenu();
    if (location.pathname === '/') {
      const elem = document.getElementById(sectionId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#' + sectionId);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          {/* Brand Logo */}
          <Link to="/" className="logo-brand" onClick={closeMobileMenu}>
            <span className="logo-title">PYHARA</span>
            <span className="logo-tagline">Honor Tradition. Protect Nature.</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop" aria-label="Main Navigation">
            <Link to="/shop" className="nav-link">Shop</Link>
            <a href="#story" onClick={(e) => handleSectionLink('story', e)} className="nav-link">Our Story</a>
            <a href="#artisans" onClick={(e) => handleSectionLink('artisans', e)} className="nav-link">Craft &amp; Makers</a>
            <a href="#sustainability" onClick={(e) => handleSectionLink('sustainability', e)} className="nav-link">Sustainability</a>
          </nav>

          {/* Header Right Actions */}
          <div className="header-actions">
            <button className="icon-btn" onClick={openSearch} aria-label="Search items" title="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <button className="icon-btn" onClick={openCart} aria-label={`Shopping Cart with ${totalCount} items`} title="Cart">
              <div className="cart-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
              </div>
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
          <Link to="/shop" className="mobile-nav-link" onClick={closeMobileMenu}>Shop</Link>
          <a href="#story" className="mobile-nav-link" onClick={(e) => handleSectionLink('story', e)}>Our Story</a>
          <a href="#artisans" className="mobile-nav-link" onClick={(e) => handleSectionLink('artisans', e)}>Craft &amp; Makers</a>
          <a href="#sustainability" className="mobile-nav-link" onClick={(e) => handleSectionLink('sustainability', e)}>Sustainability</a>
        </nav>
        <div className="mobile-drawer-footer">
          <p>PYHARA — Honor Tradition. Protect Nature.</p>
        </div>
      </div>
    </header>
  );
}
