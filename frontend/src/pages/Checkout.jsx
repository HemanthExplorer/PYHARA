import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart, showToast } = useCart();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate pricing summary
  let hasNullPrice = false;
  let subtotalAmount = 0;

  cartItems.forEach((item) => {
    if (item.product.price === null || item.product.price === undefined) {
      hasNullPrice = true;
    } else {
      subtotalAmount += item.product.price * item.quantity;
    }
  });

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is currently empty.');
      return;
    }

    if (!formData.customer_name.trim()) {
      setErrorMessage('Customer name is required.');
      return;
    }
    if (!formData.customer_email.trim() || !formData.customer_email.includes('@')) {
      setErrorMessage('A valid email address is required.');
      return;
    }
    if (!formData.customer_phone.trim()) {
      setErrorMessage('Phone number is required.');
      return;
    }
    if (!formData.shipping_address.trim()) {
      setErrorMessage('Shipping address is required.');
      return;
    }

    // Construct API order payload
    const orderPayload = {
      customer_name: formData.customer_name.trim(),
      customer_email: formData.customer_email.trim().toLowerCase(),
      customer_phone: formData.customer_phone.trim(),
      shipping_address: formData.shipping_address.trim(),
      items: cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    setSubmitting(true);

    try {
      // POST /api/orders
      const createdOrder = await createOrder(orderPayload);
      
      // SUCCESS (HTTP 201): Clear cart and navigate to order confirmation page
      clearCart();
      showToast(`Order #${createdOrder.order_number} placed successfully!`);
      navigate(`/order/${createdOrder.id}`);
    } catch (err) {
      console.error('Checkout failed:', err);
      let userFriendlyMsg = 'Unable to complete your order. Please try again.';

      if (err.status === 409) {
        if (err.message && err.message.toLowerCase().includes('coming soon')) {
          userFriendlyMsg = 'One or more products are currently unavailable for order.';
        } else {
          userFriendlyMsg = 'Some items are no longer available in the requested quantity.';
        }
      } else if (err.status === 404) {
        userFriendlyMsg = 'Product or order record not found.';
      } else if (err.status === 422) {
        userFriendlyMsg = err.message || 'Please check your information and try again.';
      }

      setErrorMessage(userFriendlyMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <span className="section-tag">Checkout</span>
        <h1 className="section-title font-serif">Your Cart is Empty</h1>
        <p className="section-description" style={{ marginBottom: '2.5rem' }}>
          Add hand-crafted eco-friendly items from our catalog before checking out.
        </p>
        <Link to="/shop" className="btn btn-primary">
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page section" style={{ paddingTop: '2.5rem' }}>
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs" aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
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
              Checkout
            </li>
          </ol>
        </nav>

        <div className="section-header" style={{ textAlign: 'left', margin: '0 0 2.5rem 0', maxWidth: 'none' }}>
          <span className="section-tag">Secure Order</span>
          <h1 className="section-title font-serif">Checkout &amp; Shipping</h1>
          <p className="section-description">
            Complete your order details below. Stock is reserved immediately upon placement.
          </p>
        </div>

        {/* Error Alert Notice */}
        {errorMessage && (
          <div
            className="checkout-error-alert"
            style={{
              backgroundColor: 'rgba(184, 90, 60, 0.12)',
              border: '1px solid var(--color-clay)',
              color: 'var(--color-clay)',
              padding: '1.1rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2rem',
              fontWeight: '500',
            }}
          >
            {errorMessage}
          </div>
        )}

        <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
          <style>{`
            @media (min-width: 900px) {
              .checkout-grid {
                grid-template-columns: 1fr 420px !important;
              }
            }
          `}</style>

          {/* Form Column */}
          <div className="checkout-form-col">
            <form onSubmit={handleSubmitOrder} className="checkout-form">
              <div
                className="checkout-card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '2rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h3 className="font-serif" style={{ fontSize: '1.65rem', marginBottom: '1.5rem' }}>
                  Customer Information
                </h3>

                <div className="admin-form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="customer_name" className="form-label">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="customer_name"
                      name="customer_name"
                      className="form-input"
                      placeholder="e.g. Hemanth Kumar"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="customer_email" className="form-label">
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      type="email"
                      id="customer_email"
                      name="customer_email"
                      className="form-input"
                      placeholder="e.g. customer@example.com"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="customer_phone" className="form-label">
                      Phone Number <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      id="customer_phone"
                      name="customer_phone"
                      className="form-input"
                      placeholder="e.g. +91 9876543210"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="shipping_address" className="form-label">
                      Shipping Address <span className="req">*</span>
                    </label>
                    <textarea
                      id="shipping_address"
                      name="shipping_address"
                      rows="3"
                      className="form-input"
                      placeholder="House No, Street, Landmark, City, State, Pincode"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      disabled={submitting}
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '1.1rem 2rem',
                    fontSize: '1.05rem',
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar Column */}
          <div className="checkout-summary-col">
            <div
              className="summary-card"
              style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                position: 'sticky',
                top: '100px',
              }}
            >
              <h3 className="font-serif" style={{ fontSize: '1.65rem', marginBottom: '1.25rem' }}>
                Order Summary ({cartItems.length} items)
              </h3>

              <div
                className="summary-items"
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}
              >
                {cartItems.map((item) => {
                  const hasPrice = item.product.price !== null && item.product.price !== undefined;
                  const priceLabel = hasPrice ? `₹ ${item.product.price}` : 'Price coming soon';
                  const lineTotalLabel = hasPrice
                    ? `₹ ${(item.product.price * item.quantity).toFixed(2)}`
                    : 'Price coming soon';

                  return (
                    <div
                      key={item.product.id}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            color: 'var(--color-clay)',
                            fontWeight: '600',
                            display: 'block',
                          }}
                        >
                          {item.product.category}
                        </span>
                        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem' }}>
                          {item.product.name}
                        </h4>
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          Qty: {item.quantity} &times; {priceLabel}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: 'var(--color-clay)',
                          textAlign: 'right',
                        }}
                      >
                        {lineTotalLabel}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Calculation Row */}
              <div
                style={{
                  paddingTop: '1rem',
                  borderTop: '2px solid var(--border-medium)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span className="font-serif" style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                  Total Amount
                </span>
                <span
                  style={{
                    fontSize: hasNullPrice ? '0.9rem' : '1.25rem',
                    fontWeight: '700',
                    color: 'var(--color-clay)',
                  }}
                >
                  {hasNullPrice ? 'Total will be confirmed' : `₹ ${subtotalAmount.toFixed(2)}`}
                </span>
              </div>

              {hasNullPrice && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.75rem',
                    fontStyle: 'italic',
                  }}
                >
                  Notice: Official product pricing will be confirmed by PYHARA artisans prior to order processing.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
