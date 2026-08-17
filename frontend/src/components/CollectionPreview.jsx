import React from 'react';
import ProductCard from './ProductCard';
import { DEMO_PRODUCTS } from '../data/products';

export default function CollectionPreview() {
  return (
    <section className="section" id="shop" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">First Collection</span>
          <h2 className="section-title">Where PYHARA Begins</h2>
          <p className="section-description">
            Our first collection brings a more thoughtful approach to one of India's most cherished celebrations.
          </p>
        </div>

        <div className="products-grid">
          {DEMO_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
