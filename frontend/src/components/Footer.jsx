import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <span className="logo-title font-serif" style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '0.1em' }}>
              PYHARA
            </span>
            <p className="footer-tagline">
              Honor Tradition. Protect Nature.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.75rem', maxWidth: '300px' }}>
              Curated marketplace for culturally rooted and environmentally responsible products.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="footer-heading">Navigation</h3>
            <ul className="footer-links">
              <li><a href="#collection">Shop</a></li>
              <li><a href="#values">Our Story</a></li>
              <li><a href="#artisans">Craft &amp; Makers</a></li>
              <li><a href="#sustainability">Sustainability</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="footer-heading">Connect</h3>
            <ul className="footer-links">
              <li><span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Instagram (Placeholder)</span></li>
              <li><span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Facebook (Placeholder)</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="footer-heading">Legal</h3>
            <ul className="footer-links">
              <li><span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Privacy Policy</span></li>
              <li><span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Terms of Service</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} PYHARA. All rights reserved.</p>
          <p>Built with respect for culture, craft, and nature.</p>
        </div>
      </div>
    </footer>
  );
}
