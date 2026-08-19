import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, cancelCustomerOrder } from '../services/orderService';
import { formatCurrency, formatTotalCurrency } from '../utils/formatCurrency';
import { useCart } from '../context/CartContext';

export default function OrderTracking() {
  const { id } = useParams();
  const { showToast } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error(`Failed to load order tracking details for ${id}:`, err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleConfirmCancel = async () => {
    if (!order) return;
    setCancelling(true);
    setCancelError(null);

    try {
      const updated = await cancelCustomerOrder(order.id);
      setOrder(updated);
      setShowCancelModal(false);
      showToast(`Order #${order.order_number} has been cancelled successfully.`);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      setCancelError(err.message || 'Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h1 className="section-title font-serif">Loading order tracking...</h1>
        <p className="section-description">Fetching fulfillment timeline and item details.</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h1 className="section-title font-serif" style={{ color: 'var(--color-clay)' }}>
          Order Tracking Not Found
        </h1>
        <p className="section-description" style={{ marginBottom: '2rem' }}>
          We could not locate an active order matching identifier: <code>{id}</code>.
        </p>
        <Link to="/shop" className="btn btn-primary">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isPaid = order.payment_status === 'Paid';
  const isCancelled = order.status === 'Cancelled';
  const canCancel = !isCancelled && (order.status === 'Pending' || order.status === 'Confirmed');

  // Timeline Step Calculations
  const timelineSteps = [
    { key: 'Pending', label: 'Order Placed' },
    { key: 'Confirmed', label: 'Confirmed' },
    { key: 'Shipped', label: 'In Transit' },
    { key: 'Delivered', label: 'Delivered' },
  ];

  const getStepStatus = (stepKey) => {
    if (isCancelled) return 'disabled';
    const statusOrder = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="order-tracking-page section" style={{ paddingTop: '2.5rem' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
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
              Order Tracking
            </li>
          </ol>
        </nav>

        {/* Page Title Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="section-tag">Real-Time Fulfillment</span>
            <h1 className="font-serif" style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>
              Order Tracking #{order.order_number}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to={`/order/${order.id}`} className="btn btn-secondary btn-sm">
              Confirmation Details
            </Link>
          </div>
        </div>

        {/* Fulfillment Timeline Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '2.5rem 2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '1.75rem', textAlign: 'center' }}>
            Fulfillment Progress
          </h3>

          {isCancelled ? (
            <div
              style={{
                backgroundColor: 'rgba(184, 90, 60, 0.12)',
                border: '1px solid var(--color-clay)',
                color: 'var(--color-clay)',
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              This order has been Cancelled. Inventory stock was restored.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              {timelineSteps.map((step) => {
                const statusState = getStepStatus(step.key);
                let circleBg = 'var(--bg-elevated)';
                let circleColor = 'var(--text-muted)';
                let labelWeight = 'normal';

                if (statusState === 'completed') {
                  circleBg = 'var(--color-earth-green)';
                  circleColor = '#ffffff';
                } else if (statusState === 'active') {
                  circleBg = 'var(--color-clay)';
                  circleColor = '#ffffff';
                  labelWeight = 'bold';
                }

                return (
                  <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: circleBg,
                        color: circleColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.75rem',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {statusState === 'completed' ? '✓' : ''}
                      {statusState === 'active' ? '●' : ''}
                      {statusState === 'upcoming' ? '○' : ''}
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: labelWeight }}>{step.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {step.key}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Details & Summary Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '2rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', margin: 0 }}>
              Order Information &amp; Payment
            </h3>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="status-pill in">
                Method: {order.payment_method === 'COD' ? 'Cash on Delivery' : 'Razorpay Online'}
              </span>
              <span className={`status-pill ${isPaid ? 'in' : 'soon'}`}>
                Payment: {order.payment_status || 'Pending'}
              </span>
              <span className={`status-pill ${!isCancelled ? 'in' : 'soon'}`}>
                Status: {order.status}
              </span>
            </div>
          </div>

          {/* Customer info */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span className="spec-label">Customer Name</span>
              <div style={{ fontWeight: '600', marginTop: '0.2rem' }}>{order.customer_name}</div>
            </div>
            <div>
              <span className="spec-label">Email Address</span>
              <div style={{ fontWeight: '600', marginTop: '0.2rem' }}>{order.customer_email}</div>
            </div>
            <div>
              <span className="spec-label">Phone Number</span>
              <div style={{ fontWeight: '600', marginTop: '0.2rem' }}>{order.customer_phone}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span className="spec-label">Shipping Destination</span>
              <div style={{ fontWeight: '600', marginTop: '0.2rem', whiteSpace: 'pre-line' }}>
                {order.shipping_address}
              </div>
            </div>
          </div>

          {/* Items */}
          <h4 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            Items in Order ({order.items.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {order.items.map((item) => {
              const hasPrice = item.unit_price !== null && item.unit_price !== undefined;
              const unitPriceLabel = formatCurrency(item.unit_price);
              const lineTotalLabel = hasPrice ? formatCurrency(item.line_total) : 'Price coming soon';

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '1.05rem', fontFamily: 'var(--font-serif)' }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Qty: {item.quantity} &times; {unitPriceLabel}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', color: 'var(--color-clay)' }}>
                    {lineTotalLabel}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
            <span className="font-serif" style={{ fontSize: '1.35rem', fontWeight: '600' }}>
              Total Amount
            </span>
            <span style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-clay)' }}>
              {formatTotalCurrency(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Cancellation Button Row */}
        {canCancel && (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '1.5rem 2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-serif)' }}>Need to cancel this order?</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Orders in Pending or Confirmed status can be cancelled prior to shipment.
              </p>
            </div>
            <button
              className="btn btn-outline-clay btn-sm"
              onClick={() => setShowCancelModal(true)}
              style={{ color: 'var(--color-clay)', borderColor: 'var(--color-clay)' }}
            >
              Cancel Order
            </button>
          </div>
        )}

        {/* Actions */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '0.9rem 2.5rem' }}>
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => !cancelling && setShowCancelModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              width: '100%',
              maxWidth: '440px',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              Confirm Cancellation
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to cancel Order <strong>#{order.order_number}</strong>? Reserved inventory stock will be restored to PYHARA artisans.
            </p>

            {cancelError && (
              <div style={{ color: 'var(--color-clay)', fontSize: '0.875rem', marginBottom: '1rem', fontWeight: '500' }}>
                {cancelError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                disabled={cancelling}
                onClick={() => setShowCancelModal(false)}
              >
                Keep Order
              </button>
              <button
                className="btn btn-primary"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                style={{ backgroundColor: 'var(--color-clay)', borderColor: 'var(--color-clay)' }}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
