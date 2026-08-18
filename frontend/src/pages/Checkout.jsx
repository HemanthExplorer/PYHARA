import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { loadRazorpayScript, createPaymentOrder, verifyPayment } from '../services/paymentService';
import { formatCurrency, formatTotalCurrency } from '../utils/formatCurrency';

import { checkServiceability, getCurrentLocationPIN } from '../services/locationService';
import LocationSelectorModal from '../components/LocationSelectorModal';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart, showToast } = useCart();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    pincode: '',
    city: '',
    state: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Location PIN code verification state
  const [pinLoading, setPinLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [pinStatus, setPinStatus] = useState(null); // { valid: bool, serviceable: bool, message: str, delivery_charge: num, days: num }
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);

  // Pre-load Razorpay script safely in background on component mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'pincode') {
      const cleanVal = value.trim();
      if (cleanVal.length === 6 && /^[1-9][0-9]{5}$/.test(cleanVal)) {
        triggerPincodeLookup(cleanVal);
      } else {
        setPinStatus(null);
      }
    }
  };

  const triggerPincodeLookup = async (codeToVerify) => {
    const pin = codeToVerify || formData.pincode.trim();
    if (!pin || pin.length !== 6) return;

    setPinLoading(true);
    setPinStatus(null);

    // Query admin-controlled DB serviceability
    const svcRes = await checkServiceability(pin);
    setPinLoading(false);

    if (svcRes.serviceable) {
      setPinStatus({
        valid: true,
        serviceable: true,
        message: svcRes.message,
        delivery_charge: svcRes.delivery_charge || 0,
        estimated_delivery_days: svcRes.estimated_delivery_days || 3,
        city: svcRes.city,
        state: svcRes.state,
      });
      setFormData((prev) => ({
        ...prev,
        city: svcRes.city || prev.city || '',
        state: svcRes.state || prev.state || '',
      }));
    } else {
      setPinStatus({
        valid: false,
        serviceable: false,
        message: svcRes.message || "We currently don't deliver to this location.",
      });
    }
  };

  const handleUseMyLocation = async () => {
    setGpsLoading(true);
    setErrorMessage(null);
    setPinStatus(null);

    const geoResult = await getCurrentLocationPIN();
    setGpsLoading(false);

    if (geoResult.success && geoResult.pincode) {
      setFormData((prev) => ({ ...prev, pincode: geoResult.pincode }));
      showToast(`📍 Location detected (PIN: ${geoResult.pincode}). Verifying delivery...`);
      await triggerPincodeLookup(geoResult.pincode);
    } else {
      setErrorMessage(geoResult.error || 'Unable to retrieve location. Please enter your PIN code manually.');
    }
  };

  const handleSelectLocationFromModal = async (selectedLoc) => {
    setFormData((prev) => ({
      ...prev,
      pincode: selectedLoc.pincode,
      city: selectedLoc.city,
      state: selectedLoc.state,
    }));
    setPinStatus({
      valid: true,
      serviceable: true,
      message: `Delivery available (${selectedLoc.city}, ${selectedLoc.state}).`,
      delivery_charge: selectedLoc.delivery_charge || 0,
      estimated_delivery_days: selectedLoc.estimated_delivery_days || 3,
      city: selectedLoc.city,
      state: selectedLoc.state,
    });
    showToast(`Selected delivery area: ${selectedLoc.city} (${selectedLoc.pincode}).`);
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

    if (!formData.customer_name.trim() || formData.customer_name.trim().length < 2) {
      setErrorMessage('Customer name must be at least 2 characters.');
      return;
    }
    if (!formData.customer_email.trim() || !formData.customer_email.includes('@')) {
      setErrorMessage('A valid email address is required.');
      return;
    }
    const cleanPhone = formData.customer_phone.replace(/[\s\-]/g, '');
    if (!cleanPhone || !/^(\+91)?[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage('A valid 10-digit Indian phone number is required (e.g. +91 9876543210).');
      return;
    }
    if (!formData.shipping_address.trim() || formData.shipping_address.trim().length < 5) {
      setErrorMessage('Shipping address must be at least 5 characters.');
      return;
    }
    const cleanPin = formData.pincode.trim();
    if (!cleanPin || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setErrorMessage('A valid 6-digit Indian PIN code starting with digits 1-9 is required.');
      return;
    }

    if (pinStatus && pinStatus.valid === false) {
      setErrorMessage(pinStatus.message || 'Please enter a valid Indian postal PIN code.');
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
        pincode: cleanPin,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
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

    // 3. Create Razorpay Payment Order via Backend
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

    // 4. Check for Razorpay Test / Mock Mode (for dev environment or dummy keys)
    const isMockPayment =
      rzpData.is_mock ||
      (rzpData.razorpay_order_id &&
        (rzpData.razorpay_order_id.startsWith('order_mock_') ||
          rzpData.razorpay_order_id.startsWith('order_test_')));

    if (isMockPayment) {
      setStatusMessage('Completing Razorpay Test Mode Payment...');
      try {
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const mockSignature = `sig_mock_${Date.now()}`;

        const verifyResult = await verifyPayment(
          createdOrder.id,
          rzpData.razorpay_order_id,
          mockPaymentId,
          mockSignature
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
        console.error('Test payment verification failed:', verErr);
        setErrorMessage(verErr.message || 'Payment verification failed.');
        setSubmitting(false);
        setStatusMessage(null);
      }
      return;
    }

    // 5. Load Razorpay SDK Script safely for real Razorpay credentials
    setStatusMessage('Loading payment gateway...');
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setErrorMessage('Unable to load payment gateway SDK. Please try again or check network connection.');
      showToast('Payment gateway script failed to load.');
      setSubmitting(false);
      setStatusMessage(null);
      return;
    }

    // 6. Open Official Razorpay Checkout Overlay for real credentials
    const options = {
      key: rzpData.key_id,
      amount: rzpData.amount,
      currency: rzpData.currency || 'INR',
      name: 'PYHARA',
      description: 'PYHARA Artisan Crafts Payment',
      order_id: rzpData.razorpay_order_id,
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

                  {/* Delivery Location Section */}
                  <div className="form-group full-width" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <label className="form-label" style={{ margin: 0, fontWeight: '600', color: 'var(--text-heading)' }}>
                        Delivery Location &amp; Serviceability <span className="req">*</span>
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={handleUseMyLocation}
                          disabled={gpsLoading || submitting}
                          className="btn btn-outline"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}
                        >
                          {gpsLoading ? 'Detecting GPS...' : '📍 Use My Location'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsSelectorModalOpen(true)}
                          disabled={submitting}
                          className="btn btn-outline"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}
                        >
                          🔍 Search Location
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="shipping_address" className="form-label">
                      Shipping Address (House No, Building, Street, Landmark) <span className="req">*</span>
                    </label>
                    <textarea
                      id="shipping_address"
                      name="shipping_address"
                      rows="3"
                      className="form-input"
                      placeholder="e.g. #42 Green Village Road, 3rd Block"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      disabled={submitting}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="pincode" className="form-label">
                      PIN Code <span className="req">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        className="form-input"
                        placeholder="e.g. 560001"
                        maxLength="6"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        onBlur={() => triggerPincodeLookup()}
                        disabled={submitting || gpsLoading}
                        required
                      />
                    </div>
                    {pinLoading && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                        Verifying location serviceability...
                      </span>
                    )}
                    {pinStatus && (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          marginTop: '0.25rem',
                          display: 'block',
                          color: pinStatus.valid ? 'var(--color-earth-green)' : 'var(--color-clay)',
                        }}
                      >
                        {pinStatus.valid ? `✓ ${pinStatus.message}` : `✕ ${pinStatus.message}`}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="city" className="form-label">
                      City / District
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="form-input"
                      placeholder="e.g. Bengaluru"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="state" className="form-label">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      className="form-input"
                      placeholder="e.g. Karnataka"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
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

              {/* Subtotal & Delivery Charge Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ fontWeight: '600' }}>
                    {hasNullPrice ? 'Subtotal unavailable' : formatCurrency(subtotalAmount)}
                  </span>
                </div>
                {pinStatus && pinStatus.serviceable && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Delivery Charge ({pinStatus.estimated_delivery_days} days)
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--color-leaf)' }}>
                      {pinStatus.delivery_charge > 0 ? formatCurrency(pinStatus.delivery_charge) : 'FREE Delivery'}
                    </span>
                  </div>
                )}
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
                  {hasNullPrice
                    ? 'Total will be confirmed'
                    : formatTotalCurrency(subtotalAmount + (pinStatus && pinStatus.serviceable ? Number(pinStatus.delivery_charge || 0) : 0))}
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

      {/* Location Selection Modal */}
      <LocationSelectorModal
        isOpen={isSelectorModalOpen}
        onClose={() => setIsSelectorModalOpen(false)}
        onSelectLocation={handleSelectLocationFromModal}
      />
    </div>
  );
}
