import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import { loadRazorpayScript, createPaymentOrder, verifyPayment } from '../services/paymentService';
import { formatCurrency, formatTotalCurrency } from '../utils/formatCurrency';
import { useCart } from '../context/CartContext';

export default function OrderConfirmation() {
  const { id } = useParams();
  const { showToast } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error(`Failed to load order details for ${id}:`, err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleRetryPayment = async () => {
    if (!order || order.total_amount === null) return;
    setPaying(true);
    setPayError(null);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setPayError('Unable to load payment gateway script.');
      setPaying(false);
      return;
    }

    try {
      const rzpData = await createPaymentOrder(order.id);
      const options = {
        key: rzpData.key_id,
        amount: rzpData.amount,
        currency: rzpData.currency || 'INR',
        name: 'PYHARA',
        description: `Payment for Order #${order.order_number}`,
        prefill: {
          name: order.customer_name,
          email: order.customer_email,
          contact: order.customer_phone,
        },
        theme: { color: '#b85a3c' },
        handler: async function (response) {
          try {
            const verifyResult = await verifyPayment(
              order.id,
              response.razorpay_order_id || rzpData.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            if (verifyResult && verifyResult.payment_status === 'Paid') {
              showToast('Payment verified successfully!');
              await fetchOrderDetails();
            } else {
              setPayError('Payment verification failed.');
            }
          } catch (verErr) {
            setPayError(verErr.message || 'Payment verification failed.');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
            showToast('Payment was not completed.');
          },
        },
      };

      if (rzpData.razorpay_order_id) {
        options.order_id = rzpData.razorpay_order_id;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment initialization failed:', err);
      setPayError(err.message || 'Failed to start payment.');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h1 className="section-title font-serif">Loading order details...</h1>
        <p className="section-description">Fetching order confirmation record from PYHARA server.</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h1 className="section-title font-serif" style={{ color: 'var(--color-clay)' }}>
          Order Not Found
        </h1>
        <p className="section-description" style={{ marginBottom: '2rem' }}>
          We could not locate an order matching ID or order number: <code>{id}</code>.
        </p>
        <Link to="/shop" className="btn btn-primary">
          Return to Shop
        </Link>
      </div>
    );
  }

  const createdDateFormatted = new Date(order.created_at).toLocaleString();
  const isPaid = order.payment_status === 'Paid';

  return (
    <div className="order-confirmation-page section" style={{ paddingTop: '2.5rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Success Header Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
            marginBottom: '2.5rem',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: isPaid ? 'rgba(46, 67, 52, 0.12)' : 'rgba(184, 90, 60, 0.12)',
              color: isPaid ? 'var(--color-earth-green)' : 'var(--color-clay)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              margin: '0 auto 1.25rem auto',
            }}
          >
            {isPaid ? '✓' : '!'}
          </div>

          <span className="section-tag" style={{ color: isPaid ? 'var(--color-earth-green)' : 'var(--color-clay)' }}>
            {isPaid ? 'Order Confirmed & Paid' : 'Order Received'}
          </span>
          <h1 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {isPaid ? 'Thank You for Your Payment!' : 'Order Placed (Payment Pending)'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
            Your order number is <strong style={{ color: 'var(--text-main)' }}>{order.order_number}</strong>
          </p>

          <div
            style={{
              display: 'inline-flex',
              gap: '1.5rem',
              alignItems: 'center',
              backgroundColor: 'var(--bg-elevated)',
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <span>Date: <strong>{createdDateFormatted}</strong></span>
            <span>
              Payment:{' '}
              <strong className={`status-pill ${isPaid ? 'in' : 'soon'}`} style={{ marginLeft: '0.25rem' }}>
                {order.payment_status || 'Pending'}
              </strong>
            </span>
            <span>
              Fulfillment:{' '}
              <strong className={`status-pill ${order.status === 'Confirmed' ? 'in' : 'soon'}`} style={{ marginLeft: '0.25rem' }}>
                {order.status}
              </strong>
            </span>
          </div>

          {/* Retry Payment Button if Pending */}
          {!isPaid && order.status !== 'Cancelled' && order.total_amount !== null && (
            <div style={{ marginTop: '1.5rem' }}>
              {payError && (
                <div style={{ color: 'var(--color-clay)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '500' }}>
                  {payError}
                </div>
              )}
              <button
                className="btn btn-primary"
                onClick={handleRetryPayment}
                disabled={paying}
                style={{ padding: '0.8rem 2rem' }}
              >
                {paying ? 'Opening Payment...' : `Complete Payment (${formatTotalCurrency(order.total_amount)})`}
              </button>
            </div>
          )}
        </div>

        {/* Order Details Grid */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '2rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2.5rem',
          }}
        >
          <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>
            Customer &amp; Shipping Details
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
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
              <span className="spec-label">Shipping Address</span>
              <div style={{ fontWeight: '600', marginTop: '0.2rem', whiteSpace: 'pre-line' }}>
                {order.shipping_address}
              </div>
            </div>
          </div>

          <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>
            Ordered Items
          </h3>

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
                      ID: {item.product_id} &bull; Qty: {item.quantity} &times; {unitPriceLabel}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', color: 'var(--color-clay)' }}>
                    {lineTotalLabel}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
            <span className="font-serif" style={{ fontSize: '1.35rem', fontWeight: '600' }}>
              Total Amount
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-clay)' }}>
              {formatTotalCurrency(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/orders/${order.id}`} className="btn btn-secondary" style={{ padding: '0.9rem 2rem' }}>
            Track Order Progress &rarr;
          </Link>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '0.9rem 2.5rem' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
