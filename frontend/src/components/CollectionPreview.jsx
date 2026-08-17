import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { getProducts } from '../services/productService';
import { DEMO_PRODUCTS } from '../data/products';

export default function CollectionPreview() {
  const [products, setProducts] = useState(DEMO_PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    getProducts()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {
        // Fallback to local DEMO_PRODUCTS seamlessly if API is offline
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Explore All CTA */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <Link to="/shop" className="btn btn-outline-clay" style={{ padding: '1rem 2.5rem', fontWeight: '700' }}>
            Explore All Products &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
