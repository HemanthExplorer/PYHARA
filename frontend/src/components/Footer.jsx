import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Brand Info */}
          <div className="footer-brand">
            <Link to="/" className="logo-brand">
              <span className="logo-title">PYHARA</span>
              <span className="logo-tagline">Honor Tradition. Protect Nature.</span>
            </Link>
            <p className="footer-tagline">
              Bringing meaningful Indian heritage craft, natural products, and conscious choices into modern life.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/shop">Shop Collection</Link></li>
              <li><a href="#story">Our Philosophy</a></li>
              <li><a href="#artisans">Artisans &amp; Makers</a></li>
              <li><a href="#sustainability">Impact Commitments</a></li>
            </ul>
          </div>

          {/* Column 3: Collections */}
          <div>
            <h4 className="footer-heading">Collections</h4>
            <ul className="footer-links">
              <li><Link to="/shop">Ganesh Idols</Link></li>
              <li><span style={{ opacity: 0.6, cursor: 'default' }}>Traditional Clothing (Soon)</span></li>
              <li><span style={{ opacity: 0.6, cursor: 'default' }}>Plants &amp; Green Living (Soon)</span></li>
              <li><span style={{ opacity: 0.6, cursor: 'default' }}>Home &amp; Craft (Soon)</span></li>
            </ul>
          </div>

          {/* Column 4: Internal / Platform */}
          <div>
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/admin/products">Admin Management</Link></li>
              <li><a href="#story">About PYHARA</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} PYHARA. All rights reserved.</p>
          <p className="footer-credit">Built with care for nature &amp; tradition.</p>
        </div>
      </div>
    </footer>
  );
}
