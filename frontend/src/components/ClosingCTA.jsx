import React from 'react';
import { Link } from 'react-router-dom';

export default function ClosingCTA() {
  return (
    <section className="closing-cta">
      <div className="container">
        <h2 className="closing-title">Keep What Matters Close.</h2>
        <p className="closing-sub">
          Traditions evolve. The values behind them don't have to.
        </p>
        <Link to="/shop" className="btn btn-primary" style={{ backgroundColor: 'var(--color-clay)', boxShadow: '0 4px 14px rgba(184, 90, 60, 0.4)' }}>
          Discover PYHARA
        </Link>
      </div>
    </section>
  );
}
