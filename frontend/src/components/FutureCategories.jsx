import React from 'react';
import { FUTURE_CATEGORIES } from '../data/products';
import { useCart } from '../context/CartContext';

export default function FutureCategories() {
  const { showToast } = useCart();

  const handleCategoryClick = (categoryTitle) => {
    showToast(`"${categoryTitle}" is coming soon to PYHARA.`);
  };

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
            <div
              key={cat.id}
              className="future-card"
              onClick={() => handleCategoryClick(cat.title)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCategoryClick(cat.title);
                }
              }}
              aria-label={`View coming soon category: ${cat.title}`}
            >
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
