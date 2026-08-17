import React from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { openProductDetail } = useCart();

  if (!product) return null;

  const displayPrice = product.price !== null && product.price !== undefined
    ? `₹ ${product.price}`
    : 'Price coming soon';

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
        <p className="product-descriptor">{product.material}</p>

        <div className="product-footer">
          <span className="product-price">{displayPrice}</span>
          <button
            className="btn btn-outline-clay"
            onClick={() => openProductDetail(product)}
            aria-label={`View product details for ${product.name}`}
          >
            View Product
          </button>
        </div>
      </div>
    </article>
  );
}
