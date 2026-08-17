import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalCount,
  } = useCart();

  if (!isCartOpen) return null;

  // Calculate subtotal or determine if price is null
  let hasNullPrice = false;
  let subtotal = 0;

  cartItems.forEach((item) => {
    if (item.product.price === null || item.product.price === undefined) {
      hasNullPrice = true;
    } else {
      subtotal += item.product.price * item.quantity;
    }
  });

  const subtotalDisplay = hasNullPrice
    ? 'Subtotal unavailable'
    : `₹ ${subtotal.toFixed(2)}`;

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="modal-backdrop" onClick={closeCart}>
      <div
        className="cart-drawer-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div className="cart-header-title-group">
            <h2 className="cart-drawer-title font-serif">Your Cart</h2>
            <span className="cart-count-pill">{totalCount} items</span>
          </div>

          <button
            className="modal-close-btn"
            onClick={closeCart}
            aria-label="Close cart drawer"
          >
            &times;
          </button>
        </div>

        {/* Drawer Body */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <h3 className="cart-empty-title font-serif">Your cart is empty</h3>
              <p className="cart-empty-desc">
                Explore our hand-crafted eco-friendly collections and support traditional artisans.
              </p>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const itemPriceDisplay =
                  item.product.price !== null && item.product.price !== undefined
                    ? `₹ ${item.product.price}`
                    : 'Price coming soon';

                return (
                  <div key={item.product.id} className="cart-item-row">
                    <img
                      src={item.product.image}
                      alt={item.product.altText || item.product.name}
                      className="cart-item-img"
                    />

                    <div className="cart-item-info">
                      <span className="cart-item-cat">{item.product.category}</span>
                      <h4 className="cart-item-title">{item.product.name}</h4>
                      <span className="cart-item-price">{itemPriceDisplay}</span>

                      <div className="cart-item-controls">
                        <div className="qty-selector-sm">
                          <button
                            className="qty-btn-sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            aria-label="Decrease item quantity"
                          >
                            -
                          </button>
                          <span className="qty-value-sm">{item.quantity}</span>
                          <button
                            className="qty-btn-sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            aria-label="Increase item quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal-row">
              <span className="subtotal-label font-serif">Subtotal</span>
              <span className="subtotal-value">{subtotalDisplay}</span>
            </div>
            <p className="subtotal-note">
              {hasNullPrice
                ? 'Official prices are being confirmed with artisan guilds.'
                : 'Taxes and shipping calculated at checkout.'}
            </p>

            <button
              className="btn btn-primary cart-checkout-btn"
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
