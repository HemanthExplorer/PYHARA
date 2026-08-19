import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/adminService';
import { formatCurrency, formatTotalCurrency } from '../utils/formatCurrency';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin dashboard stats:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="admin-page section" style={{ paddingTop: '2.5rem' }}>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <h2 className="font-serif">Loading Admin Dashboard...</h2>
          <p style={{ color: 'var(--text-muted)' }}>Retrieving live statistics and recent order data.</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="admin-page section" style={{ paddingTop: '2.5rem' }}>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <h2 className="font-serif" style={{ color: 'var(--color-clay)' }}>
            Dashboard Error
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Unable to load dashboard analytics. Please ensure the backend server is running.
          </p>
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

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
            <Link to="/admin/dashboard" className="btn btn-primary btn-sm">
              Dashboard
            </Link>
            <Link to="/admin/products" className="btn btn-secondary btn-sm">
              Products
            </Link>
            <Link to="/admin/orders" className="btn btn-secondary btn-sm">
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

        {/* Page Header */}
        <div className="admin-header-row" style={{ marginBottom: '2.5rem' }}>
          <div>
            <span className="section-tag">Overview &amp; Analytics</span>
            <h1 className="admin-title font-serif">Admin Business Dashboard</h1>
            <p className="admin-subtitle">
              Monitor key commerce metrics, total revenue, inventory alerts, and recent customer orders.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Total Orders Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span className="spec-label">Total Orders</span>
            <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-serif)', margin: '0.5rem 0' }}>
              {stats.total_orders}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All time placed orders</div>
          </div>

          {/* Pending Orders Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span className="spec-label">Pending Orders</span>
            <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-serif)', color: 'var(--color-clay)', margin: '0.5rem 0' }}>
              {stats.pending_orders}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Awaiting fulfillment or confirmation</div>
          </div>

          {/* Paid Orders Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span className="spec-label">Paid Orders</span>
            <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-serif)', color: 'var(--color-earth-green)', margin: '0.5rem 0' }}>
              {stats.paid_orders}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Razorpay payments</div>
          </div>

          {/* Total Revenue Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span className="spec-label">Total Revenue</span>
            <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-serif)', color: 'var(--color-earth-green)', margin: '0.5rem 0' }}>
              {formatTotalCurrency(stats.total_revenue)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified paid orders sum</div>
          </div>

          {/* Low Stock Products Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span className="spec-label">Low Stock Products</span>
            <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-serif)', color: stats.low_stock_count > 0 ? '#d97706' : 'var(--text-main)', margin: '0.5rem 0' }}>
              {stats.low_stock_count}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stock &le; 3 items remaining</div>
          </div>

          {/* Out of Stock Products Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span className="spec-label">Out of Stock</span>
            <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-serif)', color: stats.out_of_stock_count > 0 ? 'var(--color-clay)' : 'var(--text-main)', margin: '0.5rem 0' }}>
              {stats.out_of_stock_count}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stock quantity is zero</div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '2rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', margin: 0 }}>
              Recent Orders
            </h3>
            <Link to="/admin/orders" className="btn btn-secondary btn-sm">
              View All Orders &rarr;
            </Link>
          </div>

          {stats.recent_orders.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No recent orders placed yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem 1rem' }}>Order Number</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Customer</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Amount</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Payment</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Fulfillment</th>
                    <th style={{ padding: '0.8rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_orders.map((ord) => {
                    const isPaid = ord.payment_status === 'Paid';
                    const amountLabel = formatTotalCurrency(ord.total_amount);

                    return (
                      <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '1rem', fontWeight: '600', fontFamily: 'var(--font-serif)' }}>
                          {ord.order_number}
                        </td>
                        <td style={{ padding: '1rem' }}>{ord.customer_name}</td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-clay)' }}>
                          {amountLabel}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`status-pill ${isPaid ? 'in' : 'soon'}`}>
                            {ord.payment_status || 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`status-pill ${ord.status === 'Confirmed' || ord.status === 'Delivered' ? 'in' : 'soon'}`}>
                            {ord.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(ord.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <Link to="/admin/orders" className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
