import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminOrders, updateOrderStatus, markCodPaid } from '../services/orderService';
import { getPaymentForOrder } from '../services/paymentService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatTotalCurrency } from '../utils/formatCurrency';

export default function AdminOrders() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Selected Order Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getAdminOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedOrder && !updatingStatus && !markingPaid) {
        setSelectedOrder(null);
        setPaymentDetails(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOrder, updatingStatus, markingPaid]);

  const handleOpenDetail = async (ord) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setStatusError(null);
    setPaymentDetails(null);

    if (ord.payment_method !== 'COD') {
      setLoadingPayment(true);
      try {
        const pmt = await getPaymentForOrder(ord.id);
        setPaymentDetails(pmt);
      } catch (err) {
        console.warn('No payment record retrieved:', err);
      } finally {
        setLoadingPayment(false);
      }
    }
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    if (newStatus === selectedOrder.status) {
      setSelectedOrder(null);
      return;
    }

    setUpdatingStatus(true);
    setStatusError(null);

    try {
      const updated = await updateOrderStatus(selectedOrder.id, newStatus);
      showToast(`Order #${updated.order_number} status updated to ${updated.status}.`);
      setSelectedOrder(null);
      setPaymentDetails(null);
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      setStatusError(err.message || 'Invalid status transition.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkCodPaid = async () => {
    if (!selectedOrder) return;
    setMarkingPaid(true);
    try {
      const updated = await markCodPaid(selectedOrder.id);
      showToast(`Order #${updated.order_number} marked as Paid (COD)!`);
      setSelectedOrder(updated);
      await fetchOrders();
    } catch (err) {
      console.error('Failed to mark COD paid:', err);
      showToast(err.message || 'Failed to mark COD paid.', 'error');
    } finally {
      setMarkingPaid(false);
    }
  };

  return (
    <div className="admin-page section" style={{ paddingTop: '2.5rem' }}>
      <div className="container">
        {/* Navigation Tabs Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/admin" className="btn btn-secondary btn-sm">
              Dashboard
            </Link>
            <Link to="/admin/products" className="btn btn-secondary btn-sm">
              Products
            </Link>
            <Link to="/admin/orders" className="btn btn-primary btn-sm">
              Orders
            </Link>
            <Link to="/admin/locations" className="btn btn-secondary btn-sm">
              Locations
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user && (
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-clay)' }}>
                Admin: {user.username}
              </span>
            )}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
            >
              Logout
            </button>
            <Link to="/shop" className="btn btn-outline-clay btn-sm">
              &larr; Back to Shop
            </Link>
          </div>
        </div>

        {/* Page Title & Actions */}
        <div className="admin-header-row">
          <div>
            <span className="section-tag">Internal Management</span>
            <h1 className="admin-title font-serif">Customer Orders &amp; Payments</h1>
            <p className="admin-subtitle">
              View customer purchases, track payment status, and manage order fulfillment states.
            </p>
          </div>

          <div className="admin-header-actions">
            <button className="btn btn-secondary" onClick={fetchOrders} disabled={loading}>
              Refresh Orders
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="shop-empty-state" style={{ padding: '5rem 1rem', marginTop: '2rem' }}>
            <h3 className="empty-title">Loading orders...</h3>
            <p className="empty-desc">Fetching customer order history from FastAPI server.</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="shop-empty-state" style={{ padding: '5rem 1rem', marginTop: '2rem' }}>
            <h3 className="empty-title" style={{ color: 'var(--color-clay)' }}>
              Unable to load customer orders. Please try again.
            </h3>
            <p className="empty-desc">Couldn't fetch order records from backend server.</p>
            <button className="btn btn-primary" onClick={fetchOrders} style={{ marginTop: '1.5rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && (
          <div className="admin-table-wrapper" style={{ marginTop: '2.5rem' }}>
            {orders.length === 0 ? (
              <div className="shop-empty-state">
                <h3 className="empty-title">No customer orders found.</h3>
                <p className="empty-desc">When customers place orders via checkout, they will appear here.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total Amount</th>
                      <th>Method</th>
                      <th>Payment Status</th>
                      <th>Fulfillment Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => {
                      const totalLabel = formatTotalCurrency(ord.total_amount);

                      const isCancelled = ord.status === 'Cancelled';
                      const isDelivered = ord.status === 'Delivered';
                      const statusClass = isCancelled
                        ? 'admin-tag-out'
                        : isDelivered
                        ? 'admin-tag-avail'
                        : 'admin-tag-cat';

                      const pmtStatus = ord.payment_status || 'Pending';
                      const pmtClass = pmtStatus === 'Paid'
                        ? 'admin-tag-avail'
                        : pmtStatus === 'Failed'
                        ? 'admin-tag-out'
                        : 'admin-tag-soon';

                      const methodLabel = ord.payment_method === 'COD' ? 'Cash on Delivery (COD)' : 'Razorpay / Online';

                      return (
                        <tr key={ord.id}>
                          <td>
                            <div className="admin-prod-name">{ord.order_number}</div>
                            <div className="admin-prod-id">ID: {ord.id.slice(0, 8)}...</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '600' }}>{ord.customer_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {ord.customer_email}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {new Date(ord.created_at).toLocaleDateString()}
                          </td>
                          <td className="admin-price-cell">{totalLabel}</td>
                          <td>
                            <span className="admin-tag-cat" style={{ backgroundColor: 'rgba(46,67,52,0.08)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}>
                              {methodLabel}
                            </span>
                          </td>
                          <td>
                            <span className={pmtClass}>{pmtStatus}</span>
                          </td>
                          <td>
                            <span className={statusClass}>{ord.status}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-sm btn-outline-clay"
                              onClick={() => handleOpenDetail(ord)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Detail & Payment Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => !updatingStatus && !markingPaid && setSelectedOrder(null)}>
          <div
            className="admin-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Order Details"
            style={{ maxWidth: '720px' }}
          >
            <button
              className="modal-close-btn"
              onClick={() => !updatingStatus && !markingPaid && setSelectedOrder(null)}
              aria-label="Close modal"
              disabled={updatingStatus || markingPaid}
            >
              &times;
            </button>

            <div className="admin-modal-header">
              <h2 className="admin-modal-title font-serif">Order #{selectedOrder.order_number}</h2>
              <p className="admin-modal-sub">Internal ID: {selectedOrder.id}</p>
            </div>

            <div className="admin-form-body">
              {/* Status Update Form */}
              <form onSubmit={handleStatusUpdateSubmit} style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <label htmlFor="order-status-select" className="form-label" style={{ marginBottom: '0.5rem' }}>
                    Update Order Fulfillment Status:
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                      id="order-status-select"
                      className="form-input"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={updatingStatus || markingPaid}
                      style={{ flex: 1 }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled (Restores stock if Pending/Confirmed)</option>
                    </select>

                    <button type="submit" className="btn btn-primary btn-sm" disabled={updatingStatus || markingPaid}>
                      {updatingStatus ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>

                  {statusError && (
                    <div style={{ color: 'var(--color-clay)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: '500' }}>
                      {statusError}
                    </div>
                  )}
                </div>
              </form>

              {/* Payment Information Box */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 className="font-serif" style={{ fontSize: '1.25rem', margin: 0 }}>
                    Payment Information ({selectedOrder.payment_method === 'COD' ? 'Cash on Delivery' : 'Razorpay Online'})
                  </h4>
                  {selectedOrder.payment_method === 'COD' && selectedOrder.payment_status !== 'Paid' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleMarkCodPaid}
                      disabled={markingPaid || updatingStatus}
                      style={{ padding: '0.4rem 0.9rem', fontSize: '0.825rem' }}
                    >
                      {markingPaid ? 'Marking Paid...' : '✓ Mark COD as Paid'}
                    </button>
                  )}
                </div>

                {selectedOrder.payment_method === 'COD' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <div>
                      <span className="spec-label">Payment Method:</span> <strong>Cash on Delivery (COD)</strong>
                    </div>
                    <div>
                      <span className="spec-label">Payment Status:</span>{' '}
                      <strong style={{ color: selectedOrder.payment_status === 'Paid' ? 'var(--color-earth-green)' : 'var(--color-clay)' }}>
                        {selectedOrder.payment_status || 'Pending'}
                      </strong>
                    </div>
                    <div>
                      <span className="spec-label">Order Total:</span>{' '}
                      <strong>{formatTotalCurrency(selectedOrder.total_amount)}</strong>
                    </div>
                    <div>
                      <span className="spec-label">Cash Collection:</span>{' '}
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {selectedOrder.payment_status === 'Paid' ? 'Collected by Courier / Agent' : 'Pending Upon Delivery'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {loadingPayment ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading payment transaction details...</p>
                    ) : paymentDetails ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                        <div>
                          <span className="spec-label">Payment Status:</span>{' '}
                          <strong style={{ color: paymentDetails.status === 'Paid' ? 'var(--color-earth-green)' : 'var(--color-clay)' }}>
                            {paymentDetails.status}
                          </strong>
                        </div>
                        <div>
                          <span className="spec-label">Amount:</span>{' '}
                          <strong>{formatCurrency(paymentDetails.amount)} ({paymentDetails.currency})</strong>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <span className="spec-label">Razorpay Order ID:</span>{' '}
                          <code style={{ fontSize: '0.85rem' }}>{paymentDetails.razorpay_order_id}</code>
                        </div>
                        {paymentDetails.razorpay_payment_id && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <span className="spec-label">Razorpay Payment ID:</span>{' '}
                            <code style={{ fontSize: '0.85rem' }}>{paymentDetails.razorpay_payment_id}</code>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Payment Status: <strong>{selectedOrder.payment_status || 'Pending'}</strong> (No active Razorpay payment transaction linked).
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Customer Details Box */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.5rem',
                }}
              >
                <h4 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                  Customer Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div>
                    <span className="spec-label">Name:</span> <strong>{selectedOrder.customer_name}</strong>
                  </div>
                  <div>
                    <span className="spec-label">Email:</span> <strong>{selectedOrder.customer_email}</strong>
                  </div>
                  <div>
                    <span className="spec-label">Phone:</span> <strong>{selectedOrder.customer_phone}</strong>
                  </div>
                  <div>
                    <span className="spec-label">Placed On:</span>{' '}
                    <strong>{new Date(selectedOrder.created_at).toLocaleString()}</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span className="spec-label">Address:</span>{' '}
                    <strong>{selectedOrder.shipping_address}</strong>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h4 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                  Ordered Items ({selectedOrder.items?.length || 0})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.9rem',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div>
                        <strong>{item.product_name}</strong> (ID: {item.product_id})
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Qty: {item.quantity} &times;{' '}
                          {formatCurrency(item.unit_price)}
                        </div>
                      </div>
                      <div style={{ fontWeight: '600', color: 'var(--color-clay)' }}>
                        {item.unit_price !== null ? formatCurrency(item.line_total) : 'Price coming soon'}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '2px solid var(--border-medium)' }}>
                  <span className="font-serif" style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                    Total Order Amount
                  </span>
                  <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-clay)' }}>
                    {formatTotalCurrency(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
