import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminOrders, updateOrderStatus } from '../services/orderService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function AdminOrders() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Selected Order Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
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
      if (e.key === 'Escape' && selectedOrder && !updatingStatus) {
        setSelectedOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOrder, updatingStatus]);

  const handleOpenDetail = (ord) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setStatusError(null);
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
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      setStatusError(err.message || 'Invalid status transition.');
    } finally {
      setUpdatingStatus(false);
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
            <Link to="/admin/products" className="btn btn-secondary btn-sm">
              Products
            </Link>
            <Link to="/admin/orders" className="btn btn-primary btn-sm">
              Orders
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
            <h1 className="admin-title font-serif">Customer Orders</h1>
            <p className="admin-subtitle">
              View customer purchases, track fulfillment states, or manage order cancellations.
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
                      <th>Items</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => {
                      const totalLabel =
                        ord.total_amount !== null && ord.total_amount !== undefined
                          ? `₹ ${ord.total_amount}`
                          : 'Total will be confirmed';

                      const isCancelled = ord.status === 'Cancelled';
                      const isDelivered = ord.status === 'Delivered';
                      const statusClass = isCancelled
                        ? 'admin-tag-out'
                        : isDelivered
                        ? 'admin-tag-avail'
                        : 'admin-tag-cat';

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
                          <td style={{ fontWeight: '600' }}>
                            {ord.items ? ord.items.reduce((s, i) => s + i.quantity, 0) : 0} units
                          </td>
                          <td className="admin-price-cell">{totalLabel}</td>
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

      {/* Order Detail & Status Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => !updatingStatus && setSelectedOrder(null)}>
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
              onClick={() => !updatingStatus && setSelectedOrder(null)}
              aria-label="Close modal"
              disabled={updatingStatus}
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
                      disabled={updatingStatus}
                      style={{ flex: 1 }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled (Restores stock if Pending/Confirmed)</option>
                    </select>

                    <button type="submit" className="btn btn-primary btn-sm" disabled={updatingStatus}>
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
                          {item.unit_price !== null ? `₹ ${item.unit_price}` : 'Price coming soon'}
                        </div>
                      </div>
                      <div style={{ fontWeight: '600', color: 'var(--color-clay)' }}>
                        {item.line_total !== null ? `₹ ${item.line_total}` : 'Price coming soon'}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '2px solid var(--border-medium)' }}>
                  <span className="font-serif" style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                    Total Order Amount
                  </span>
                  <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-clay)' }}>
                    {selectedOrder.total_amount !== null && selectedOrder.total_amount !== undefined
                      ? `₹ ${selectedOrder.total_amount}`
                      : 'Total will be confirmed'}
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
