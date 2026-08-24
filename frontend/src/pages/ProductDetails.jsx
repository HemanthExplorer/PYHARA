import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProducts, getRelatedProducts } from '../services/productService';
import * as reviewService from '../services/reviewService';
import * as wishlistService from '../services/wishlistService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { formatCurrency } from '../utils/formatCurrency';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, showToast } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Wishlist & Reviews state
  const [inWishlist, setInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ review_count: 0, average_rating: 0 });
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductDetail = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [singleProd, list, revs, summary] = await Promise.all([
        getProductById(id),
        getProducts().catch(() => []),
        reviewService.getProductReviews(id).catch(() => []),
        reviewService.getProductRatingSummary(id).catch(() => ({ review_count: 0, average_rating: 0 })),
      ]);
      setProduct(singleProd);
      setAllProducts(list);
      setReviews(revs);
      setRatingSummary(summary);

      if (isAuthenticated) {
        wishlistService.getWishlist().then((wItems) => {
          setInWishlist(wItems.some((item) => item.product_id === id));
        }).catch(() => {});
      }
    } catch (err) {
      console.error(`Error loading product detail for ID ${id}:`, err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    fetchProductDetail();
    setQuantity(1);
  }, [fetchProductDetail]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      if (inWishlist) {
        await wishlistService.removeFromWishlist(id);
        setInWishlist(false);
        showToast('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(id);
        setInWishlist(true);
        showToast('Added to wishlist ❤️');
      }
    } catch (err) {
      showToast(err.message || 'Wishlist update failed');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      await reviewService.submitProductReview(id, newRating, newComment);
      showToast('Review submitted! Thank you.');
      setNewComment('');
      // Reload reviews
      const [revs, summary] = await Promise.all([
        reviewService.getProductReviews(id),
        reviewService.getProductRatingSummary(id),
      ]);
      setReviews(revs);
      setRatingSummary(summary);
    } catch (err) {
      showToast(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h1 className="section-title">Loading product details...</h1>
        <p className="section-description">Retrieving item specifications from PYHARA server.</p>
      </div>
    );
  }

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
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-separator">/</li>
            <li className="breadcrumb-item"><Link to="/shop">Shop</Link></li>
            <li className="breadcrumb-separator">/</li>
            <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
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
            </div>
          </div>

          {/* Product Specification Info */}
          <div className="details-info-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="product-category-label">{product.category}</span>
              <button
                className={`wishlist-heart-btn ${inWishlist ? 'active' : ''}`}
                onClick={handleToggleWishlist}
                title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                {inWishlist ? '❤️ Saved' : '🤍 Wishlist'}
              </button>
            </div>

            <h1 className="details-title font-serif">{product.name}</h1>

            {/* Rating Stars Summary */}
            <div className="rating-summary-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ color: '#E5A638', fontWeight: 'bold' }}>
                {'★'.repeat(Math.round(ratingSummary.average_rating || 5))}
                {'☆'.repeat(5 - Math.round(ratingSummary.average_rating || 5))}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {ratingSummary.average_rating ? `${ratingSummary.average_rating} / 5.0` : '5.0'} ({ratingSummary.review_count} reviews)
              </span>
            </div>

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
                <span className="spec-label">Availability:</span>
                <span className="spec-value">{statusLabel} ({product.stock_quantity} available)</span>
              </div>
            </div>

            {/* Actions: Quantity Selector & Add to Cart */}
            <div className="details-actions-row">
              <div className="quantity-selector">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!isAvailableForPurchase}
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={!isAvailableForPurchase}
                >
                  +
                </button>
              </div>

              <button
                className="btn btn-primary details-add-btn"
                onClick={handleAddToCart}
                disabled={!isAvailableForPurchase}
                style={!isAvailableForPurchase ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                {isComingSoon ? 'Coming Soon' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="reviews-section" style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border-subtle)' }}>
          <h2 className="font-serif">Customer Reviews &amp; Ratings</h2>

          <div className="reviews-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', marginTop: '1.5rem' }}>
            {/* Submit Review Box */}
            <div className="write-review-box" style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h3>Write a Review</h3>
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.35rem' }}>Rating</label>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                    >
                      <option value="5">★★★★★ (5 Stars - Excellent)</option>
                      <option value="4">★★★★☆ (4 Stars - Good)</option>
                      <option value="3">★★★☆☆ (3 Stars - Average)</option>
                      <option value="2">★★☆☆☆ (2 Stars - Poor)</option>
                      <option value="1">★☆☆☆☆ (1 Star - Terrible)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.35rem' }}>Your Review</label>
                    <textarea
                      rows="3"
                      placeholder="Share your experience with this sustainable craft item..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-primary" disabled={submittingReview} style={{ alignSelf: 'flex-start' }}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <p style={{ marginTop: '0.5rem' }}>
                  Please <button className="btn-link" onClick={() => openAuthModal('login')}>Log In</button> to write a customer review.
                </p>
              )}
            </div>

            {/* Reviews List */}
            <div className="reviews-list-box">
              {reviews.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No customer reviews yet. Be the first to leave a review!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map((rev) => (
                    <div key={rev.id} style={{ padding: '1.25rem', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '1rem' }}>{rev.user_name}</strong>
                        {rev.is_verified_buyer && (
                          <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(46, 67, 52, 0.12)', color: 'var(--color-earth-green)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                            ✓ Verified Buyer
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#E5A638', marginBottom: '0.5rem' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</div>
                      <p style={{ margin: 0, fontSize: '0.95rem' }}>{rev.comment}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                        {new Date(rev.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section" style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border-subtle)' }}>
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
