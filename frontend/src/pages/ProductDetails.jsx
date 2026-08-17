import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProducts, getRelatedProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { formatCurrency } from '../utils/formatCurrency';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const fetchProductDetail = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [singleProd, list] = await Promise.all([
        getProductById(id),
        getProducts().catch(() => []),
      ]);
      setProduct(singleProd);
      setAllProducts(list);
    } catch (err) {
      console.error(`Error loading product detail for ID ${id}:`, err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetail();
    setQuantity(1);
  }, [fetchProductDetail]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h1 className="section-title">Loading product details...</h1>
        <p className="section-description">Retrieving item specifications from PYHARA server.</p>
      </div>
    );
  }

  // 2. Network / Server API Error State
  if (error) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h1 className="section-title" style={{ color: 'var(--color-clay)' }}>
          Unable to load product details. Please try again.
        </h1>
        <p className="section-description" style={{ marginBottom: '2rem' }}>
          We could not reach the backend server to fetch product information.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={fetchProductDetail}>
            Retry
          </button>
          <Link to="/shop" className="btn btn-secondary">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  // 3. Product Not Found (404 / null) State
  if (!product) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h1 className="section-title">Product Not Found</h1>
        <p className="section-description" style={{ marginBottom: '2rem' }}>
          The product item you are looking for does not exist or may have been removed.
        </p>
        <Link to="/shop" className="btn btn-primary">
          Return to Shop
        </Link>
      </div>
    );
  }

  const relatedProducts = getRelatedProducts(allProducts, product.id, product.category, 3);

  const isComingSoon = product.availability === 'Coming Soon';
  const isOutOfStock = !isComingSoon && (product.stock_quantity === 0 || product.availability === 'Out of Stock');
  const isAvailableForPurchase = !isComingSoon && !isOutOfStock;

  const handleAddToCart = () => {
    if (!isAvailableForPurchase) return;
    addToCart(product, quantity);
  };

  const displayPrice = formatCurrency(product.price);

  const statusLabel = isComingSoon
    ? 'Coming Soon'
    : isOutOfStock
    ? 'Out of Stock'
    : 'In Stock';

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
                alt={product.altText || product.alt_text || product.name}
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
              <span className={`status-pill ${isComingSoon ? 'soon' : isOutOfStock ? 'out' : 'in'}`}>
                {statusLabel}
              </span>
            </div>

            <p className="details-description-text">{product.description}</p>

            <div className="detail-spec-box">
              <div className="spec-row">
                <span className="spec-label">Material:</span>
                <span className="spec-value">{product.material}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Status:</span>
                <span className="spec-value">{statusLabel}</span>
              </div>
            </div>

            {/* Actions: Quantity Selector & Add to Cart */}
            <div className="details-actions-row">
              <div className="quantity-selector">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  disabled={!isAvailableForPurchase}
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  disabled={!isAvailableForPurchase}
                >
                  +
                </button>
              </div>

              <button
                className="btn btn-primary details-add-btn"
                onClick={handleAddToCart}
                disabled={!isAvailableForPurchase}
                style={!isAvailableForPurchase ? { opacity: 0.6, cursor: 'not-allowed', backgroundColor: 'var(--text-dim)', borderColor: 'var(--text-dim)' } : {}}
              >
                {isComingSoon ? 'Coming Soon' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
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
