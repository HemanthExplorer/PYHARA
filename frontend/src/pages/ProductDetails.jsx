import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getRelatedProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = getProductById(id);

  // Unknown Product Fallback
  if (!product) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h1 className="section-title">Product Not Found</h1>
        <p className="section-description" style={{ marginBottom: '2rem' }}>
          The product item you are looking for does not exist or may have been moved.
        </p>
        <Link to="/shop" className="btn btn-primary">
          Return to Shop
        </Link>
      </div>
    );
  }

  const relatedProducts = getRelatedProducts(product.id, product.category, 3);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const displayPrice = product.price !== null && product.price !== undefined
    ? `₹ ${product.price}`
    : 'Price coming soon';

  return (
    <div className="product-details-page section" style={{ paddingTop: '2rem' }}>
      <div className="container">
        {/* Breadcrumb Trail */}
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol className="breadcrumb-list">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-separator">/</li>
            <li className="breadcrumb-item">
              <Link to="/shop">Shop</Link>
            </li>
            <li className="breadcrumb-separator">/</li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Details Main Grid */}
        <div className="details-main-grid">
          {/* Product Image Frame */}
          <div className="details-image-wrapper">
            <div className="details-image-frame">
              <img
                src={product.image}
                alt={product.altText || product.name}
                className="details-main-img"
              />
              <span className="demo-tag">Demo Placeholder</span>
            </div>
          </div>

          {/* Product Specification Info */}
          <div className="details-info-wrapper">
            <span className="product-category-label">{product.category}</span>
            <h1 className="details-title font-serif">{product.name}</h1>

            <div className="details-price-row">
              <span className="details-price-text">{displayPrice}</span>
              <span className="coming-soon-badge">{product.availability || 'Coming Soon'}</span>
            </div>

            <p className="details-description-text">{product.description}</p>

            <div className="detail-spec-box">
              <div className="spec-row">
                <span className="spec-label">Material:</span>
                <span className="spec-value">{product.material}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Availability:</span>
                <span className="spec-value">{product.availability || 'Coming Soon'}</span>
              </div>
            </div>

            {/* Actions: Quantity Selector & Add to Cart */}
            <div className="details-actions-row">
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

              <button className="btn btn-primary details-add-btn" onClick={handleAddToCart}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section" style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div className="section-header" style={{ marginBottom: '2rem' }}>
              <span className="section-tag">Recommendations</span>
              <h2 className="section-title">You May Also Like</h2>
            </div>

            <div className="products-grid">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
