import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductDetailModal() {
  const { selectedProductDetail, closeProductDetail, addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [selectedProductDetail]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedProductDetail) {
        closeProductDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProductDetail, closeProductDetail]);

  if (!selectedProductDetail) return null;

  const product = selectedProductDetail;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    closeProductDetail();
  };

  return (
    <div className="modal-backdrop" onClick={closeProductDetail} role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="product-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeProductDetail} aria-label="Close product details">
          &times;
        </button>

        <div className="detail-grid">
          {/* Image Area */}
          <div className="detail-image-area">
            <img src={product.image} alt={product.altText || product.name} className="detail-img" />
            <span className="demo-tag">Demo Placeholder</span>
          </div>

          {/* Product Specifications */}
          <div className="detail-content">
            <span className="detail-category">{product.category}</span>
            <h2 className="detail-title">{product.name}</h2>

            <div className="detail-meta">
              <span className="detail-price">
                {product.price ? `₹ ${product.price}` : 'Price coming soon'}
              </span>
              <span className="detail-availability-badge">
                {product.availability || 'Coming Soon'}
              </span>
            </div>

            <p className="detail-description">{product.description}</p>

            <div className="detail-spec-box">
              <div className="spec-row">
                <span className="spec-label">Material:</span>
                <span className="spec-value">{product.material}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Availability Status:</span>
                <span className="spec-value">{product.availability || 'Coming Soon'}</span>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="detail-actions">
              <div className="quantity-selector">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button className="btn btn-primary detail-add-btn" onClick={handleAddToCart}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
