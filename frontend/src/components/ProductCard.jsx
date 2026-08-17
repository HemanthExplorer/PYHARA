import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  if (!product) return null;

  const displayPrice = product.price !== null && product.price !== undefined
    ? `₹ ${product.price}`
    : 'Price coming soon';

  const isComingSoon = product.availability === 'Coming Soon';
  const isOutOfStock = !isComingSoon && (product.stock_quantity === 0 || product.availability === 'Out of Stock');

  const statusLabel = isComingSoon
    ? 'Coming Soon'
    : isOutOfStock
    ? 'Out of Stock'
    : 'In Stock';

  return (
    <article className="product-card">
      <div className="product-image-area">
        <img
          src={product.image}
          alt={product.altText || product.name}
          loading="lazy"
        />
        <span className="demo-tag">Demo Placeholder</span>
      </div>

      <div className="product-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="product-category-label">{product.category}</span>
          <span className={`status-pill ${isComingSoon ? 'soon' : isOutOfStock ? 'out' : 'in'}`}>
            {statusLabel}
          </span>
        </div>

        <h3 className="product-name">{product.name}</h3>
        <p className="product-descriptor">{product.material}</p>

        <div className="product-footer">
          <span className="product-price">{displayPrice}</span>
          <Link
            to={`/product/${product.id}`}
            className="btn btn-outline-clay"
            aria-label={`View product details for ${product.name}`}
          >
            View Product
          </Link>
        </div>
      </div>
    </article>
  );
}
