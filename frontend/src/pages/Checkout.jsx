import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { loadRazorpayScript, createPaymentOrder, verifyPayment } from '../services/paymentService';
import { formatCurrency, formatTotalCurrency } from '../utils/formatCurrency';

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
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Pre-load Razorpay script safely in background on component mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

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

  const handleCheckoutAndPay = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

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

    setSubmitting(true);
    setStatusMessage('Creating order & reserving inventory...');

    let createdOrder = null;
    try {
      // 1. Create PYHARA Order & reserve inventory
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

      createdOrder = await createOrder(orderPayload);
    } catch (err) {
      console.error('Order creation failed:', err);
      let userFriendlyMsg = 'Unable to create order. Please try again.';
      if (err.status === 409) {
        userFriendlyMsg = err.message || 'Some items are no longer available in the requested quantity.';
      } else if (err.status === 422) {
        userFriendlyMsg = err.message || 'Please check your input details.';
      }
      setErrorMessage(userFriendlyMsg);
      setSubmitting(false);
      setStatusMessage(null);
      return;
    }

    // 2. If null price, complete order creation without Razorpay payment modal
    if (hasNullPrice || createdOrder.total_amount === null || createdOrder.total_amount === undefined) {
      clearCart();
      showToast(`Order #${createdOrder.order_number} created! Total will be confirmed.`);
      navigate(`/order/${createdOrder.id}`);
      return;
    }

    // 3. Load Razorpay SDK Script safely
    setStatusMessage('Loading payment gateway...');
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setErrorMessage('Unable to load payment gateway SDK. Please try again or check network connection.');
      showToast('Payment gateway script failed to load.');
      setSubmitting(false);
      setStatusMessage(null);
      return;
    }

    // 4. Create Razorpay Payment Order via Backend
    setStatusMessage('Initializing Razorpay Checkout...');
    let rzpData = null;
    try {
      rzpData = await createPaymentOrder(createdOrder.id);
    } catch (err) {
      console.error('Razorpay order creation failed:', err);
      setErrorMessage(err.message || 'Failed to initialize payment transaction.');
      setSubmitting(false);
      setStatusMessage(null);
      return;
    }

    // 5. Open REAL Razorpay Checkout Overlay
    const options = {
      key: rzpData.key_id,
      amount: rzpData.amount,
      currency: rzpData.currency || 'INR',
      name: 'PYHARA',
      description: 'PYHARA Artisan Crafts Payment',
      prefill: {
        name: formData.customer_name.trim(),
        email: formData.customer_email.trim(),
        contact: formData.customer_phone.trim(),
      },
      theme: { color: '#b85a3c' },
      handler: async function (response) {
        setStatusMessage('Verifying payment signature...');
        try {
          const verifyResult = await verifyPayment(
            createdOrder.id,
            response.razorpay_order_id || rzpData.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          if (verifyResult && verifyResult.payment_status === 'Paid') {
            clearCart();
            showToast(`Payment successful! Order #${createdOrder.order_number} confirmed.`);
            navigate(`/order/${createdOrder.id}`);
          } else {
            setErrorMessage('Payment verification failed. Please contact support.');
            setSubmitting(false);
            setStatusMessage(null);
          }
        } catch (verErr) {
          console.error('Payment verification failed:', verErr);
          setErrorMessage(verErr.message || 'Payment verification failed.');
          setSubmitting(false);
          setStatusMessage(null);
        }
      },
      modal: {
        ondismiss: function () {
          setSubmitting(false);
          setStatusMessage(null);
          showToast('Payment was not completed.');
          clearCart();
          navigate(`/order/${createdOrder.id}`);
        },
      },
    };

    if (rzpData.razorpay_order_id) {
      options.order_id = rzpData.razorpay_order_id;
    }

    try {
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp) {
        console.error('Razorpay payment failed:', resp.error);
        setErrorMessage(`Payment failed: ${resp.error?.description || 'Transaction declined'}`);
        setSubmitting(false);
        setStatusMessage(null);
      });
      razorpayInstance.open();
    } catch (err) {
      console.error('Failed to open Razorpay modal:', err);
      setErrorMessage('Could not open payment window. Please check browser pop-up settings.');
      setSubmitting(false);
      setStatusMessage(null);
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

  const payButtonText = submitting
    ? (statusMessage || 'Processing...')
    : hasNullPrice
    ? 'Place Order (Total Pending)'
    : `Pay ${formatTotalCurrency(subtotalAmount)}`;

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
          <span className="section-tag">Razorpay Test Mode</span>
          <h1 className="section-title font-serif">Checkout &amp; Payment</h1>
          <p className="section-description">
            Complete your shipping details and proceed to secure Razorpay payment.
          </p>
        </div>

        {/* Status Notice */}
        {statusMessage && (
          <div
            style={{
              backgroundColor: 'rgba(46, 67, 52, 0.1)',
              border: '1px solid var(--color-earth-green)',
              color: 'var(--color-earth-green)',
              padding: '0.9rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {statusMessage}
          </div>
        )}

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
            <form onSubmit={handleCheckoutAndPay} className="checkout-form">
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
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {payButtonText}
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
                  const unitPriceLabel = formatCurrency(item.product.price);
                  const lineTotalLabel = hasPrice
                    ? formatCurrency(item.product.price * item.quantity)
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
                          Qty: {item.quantity} &times; {unitPriceLabel}
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

              {/* Subtotal & Total Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ fontWeight: '600' }}>
                    {hasNullPrice ? 'Subtotal unavailable' : formatCurrency(subtotalAmount)}
                  </span>
                </div>
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
                  {hasNullPrice ? 'Total will be confirmed' : formatTotalCurrency(subtotalAmount)}
                </span>
              </div>

              {hasNullPrice && (
                <div
                  style={{
                    backgroundColor: 'rgba(184, 90, 60, 0.08)',
                    border: '1px solid rgba(184, 90, 60, 0.3)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    marginTop: '1rem',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--color-clay)',
                      margin: 0,
                      fontWeight: '500',
                    }}
                  >
                    Notice: Payment unavailable until price is confirmed by PYHARA artisans.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
