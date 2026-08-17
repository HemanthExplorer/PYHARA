import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeFromCart, totalCount, showToast } = useCart();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    showToast("Checkout coming soon.");
  };

  return (
    <div className="modal-backdrop" onClick={closeCart} role="dialog" aria-modal="true" aria-label="Shopping Cart">
      <div className="cart-drawer-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-header-title-group">
            <h3 className="cart-drawer-title">Shopping Cart</h3>
            <span className="cart-count-pill">{totalCount} {totalCount === 1 ? 'item' : 'items'}</span>
          </div>
          <button className="modal-close-btn" onClick={closeCart} aria-label="Close cart drawer">
            &times;
          </button>
        </div>

        {/* Cart Content */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-dim)', marginBottom: '1rem' }}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <p className="cart-empty-title">Your cart is empty.</p>
              <p className="cart-empty-desc">Explore the collection to add handcrafted products to your cart.</p>
              <button className="btn btn-outline-clay" onClick={closeCart} style={{ marginTop: '1.5rem' }}>
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="cart-item-row">
                  <img src={product.image} alt={product.name} className="cart-item-img" />
                  
                  <div className="cart-item-info">
                    <span className="cart-item-cat">{product.category}</span>
                    <h4 className="cart-item-title">{product.name}</h4>
                    <span className="cart-item-price">
                      {product.price ? `₹ ${product.price}` : 'Price coming soon'}
                    </span>

                    <div className="cart-item-controls">
                      <div className="qty-selector-sm">
                        <button
                          className="qty-btn-sm"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label={`Decrease quantity of ${product.name}`}
                        >
                          -
                        </button>
                        <span className="qty-value-sm">{quantity}</span>
                        <button
                          className="qty-btn-sm"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          aria-label={`Increase quantity of ${product.name}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="cart-remove-btn"
                        onClick={() => removeFromCart(product.id)}
                        aria-label={`Remove ${product.name} from cart`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Subtotal and Checkout */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal-row">
              <span className="subtotal-label">Subtotal</span>
              <span className="subtotal-value">Subtotal unavailable</span>
            </div>
            <p className="subtotal-note">Pricing details will be updated upon catalog launch.</p>
            <button className="btn btn-primary cart-checkout-btn" onClick={handleCheckoutClick}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
