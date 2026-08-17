import React from 'react';

export default function ProductCard({ product }) {
  if (!product) return null;

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
        <span className="product-category-label">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-descriptor">{product.materialDescriptor}</p>

        <div className="product-footer">
          <span className="product-price">{product.pricePlaceholder}</span>
          <button className="btn btn-outline-clay" aria-label={`View product details for ${product.name}`}>
            View Product
          </button>
        </div>
      </div>
    </article>
  );
}
