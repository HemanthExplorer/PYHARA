import React from 'react';
import { FUTURE_CATEGORIES } from '../data/products';

export default function FutureCategories() {
  return (
    <section className="section" id="future-categories">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Expanding Horizons</span>
          <h2 className="section-title">More Than a Festival</h2>
          <p className="section-description">
            PYHARA begins with celebration, but our journey extends into everyday living.
          </p>
        </div>

        <div className="future-grid">
          {FUTURE_CATEGORIES.map((cat) => (
            <div key={cat.id} className="future-card">
              <span className="coming-soon-badge">{cat.status}</span>
              <h3 className="future-card-title">{cat.title}</h3>
              <p className="future-card-desc">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
