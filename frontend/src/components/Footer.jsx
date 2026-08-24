import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionLink = (sectionId, e) => {
    e.preventDefault();
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
              <li><Link to="/about">About PYHARA</Link></li>
              <li><a href="#story" onClick={(e) => handleSectionLink('story', e)}>Our Philosophy</a></li>
              <li><a href="#artisans" onClick={(e) => handleSectionLink('artisans', e)}>Artisans &amp; Makers</a></li>
              <li><Link to="/contact">Contact Support</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="footer-heading">Customer Care</h4>
            <ul className="footer-links">
              <li><Link to="/account">My Account</Link></li>
              <li><Link to="/order-tracking">Order Tracking</Link></li>
              <li><Link to="/shipping">Shipping Policy</Link></li>
              <li><Link to="/refunds">Returns &amp; Refunds</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="footer-heading">Legal &amp; Trust</h4>
            <ul className="footer-links">
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/contact">Help &amp; Contact</Link></li>
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
