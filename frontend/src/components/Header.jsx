import React from 'react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-container">
        <a href="/" className="brand-logo">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          <span>Eco Marketplace</span>
        </a>
        <span className="badge-tag">v0.1 Foundation</span>
      </div>
    </header>
  );
}
