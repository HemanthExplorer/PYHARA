import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  fetchAdminLocations,
  createAdminLocation,
  updateAdminLocation,
  deleteAdminLocation,
} from '../services/adminLocationService';
import { formatCurrency } from '../utils/formatCurrency';

export default function AdminLocations() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, active, inactive
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [deletingLoc, setDeletingLoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    pincode: '',
    city: '',
    state: '',
    is_active: true,
    delivery_charge: '50.00',
    estimated_delivery_days: 3,
    notes: '',
  });

  const checkAuthAndLoad = async () => {
    const token = localStorage.getItem('pyhara_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadLocations();
  };

  useEffect(() => {
    checkAuthAndLoad();
  }, [search, activeFilter]);

  const loadLocations = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const activeOnly = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : null;
      const data = await fetchAdminLocations(search, activeOnly);
      setLocations(data);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('token') || err.message.includes('Authorized')) {
        localStorage.removeItem('pyhara_admin_token');
        navigate('/admin/login');
      } else {
        setErrorMessage(err.message || 'Failed to load delivery locations.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setFormData({
      pincode: '',
      city: '',
      state: '',
      is_active: true,
      delivery_charge: '50.00',
      estimated_delivery_days: 3,
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    setFormData({
      pincode: loc.pincode,
      city: loc.city,
      state: loc.state,
      is_active: loc.is_active,
      delivery_charge: String(loc.delivery_charge || '0.00'),
      estimated_delivery_days: loc.estimated_delivery_days || 3,
      notes: loc.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (editingLoc) {
        await updateAdminLocation(editingLoc.id, {
          city: formData.city.trim(),
          state: formData.state.trim(),
          is_active: formData.is_active,
          delivery_charge: parseFloat(formData.delivery_charge) || 0,
          estimated_delivery_days: parseInt(formData.estimated_delivery_days) || 3,
          notes: formData.notes.trim() || null,
        });
        setSuccessMessage(`Delivery location for PIN ${formData.pincode} updated successfully.`);
      } else {
        await createAdminLocation({
          pincode: formData.pincode.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          is_active: formData.is_active,
          delivery_charge: parseFloat(formData.delivery_charge) || 0,
          estimated_delivery_days: parseInt(formData.estimated_delivery_days) || 3,
          notes: formData.notes.trim() || null,
        });
        setSuccessMessage(`New delivery location for PIN ${formData.pincode} added successfully.`);
      }

      setShowAddModal(false);
      loadLocations();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save location.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (loc) => {
    try {
      await updateAdminLocation(loc.id, { is_active: !loc.is_active });
      setSuccessMessage(`Location PIN ${loc.pincode} ${!loc.is_active ? 'enabled' : 'disabled'}.`);
      loadLocations();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update location status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLoc) return;
    setSubmitting(true);
    try {
      await deleteAdminLocation(deletingLoc.id);
      setSuccessMessage(`Delivery location PIN ${deletingLoc.pincode} deleted.`);
      setDeletingLoc(null);
      loadLocations();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete delivery location.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pyhara_admin_token');
    navigate('/admin/login');
  };

  const activeCount = locations.filter((l) => l.is_active).length;
  const inactiveCount = locations.length - activeCount;

  return (
    <div className="admin-page" style={{ padding: '2rem 1rem', backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Admin Navigation Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 className="font-serif" style={{ fontSize: '2rem', color: 'var(--text-heading)', margin: 0 }}>
              Delivery Serviceability Control
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
              Manage admin-approved delivery PIN codes, charges, and service areas.
            </p>
          </div>

          <nav style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <Link to="/admin/dashboard" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '500' }}>
              Dashboard
            </Link>
            <Link to="/admin/products" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '500' }}>
              Products
            </Link>
            <Link to="/admin/orders" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '500' }}>
              Orders
            </Link>
            <Link to="/admin/locations" style={{ color: 'var(--color-leaf)', textDecoration: 'none', fontWeight: '600' }}>
              Locations
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              Logout
            </button>
          </nav>
        </header>

        {/* Feedback Messages */}
        {errorMessage && (
          <div
            className="alert alert-error"
            style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              borderRadius: '6px',
              marginBottom: '1.5rem',
            }}
          >
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div
            className="alert alert-success"
            style={{
              padding: '1rem',
              backgroundColor: '#dcfce7',
              border: '1px solid #86efac',
              color: '#166534',
              borderRadius: '6px',
              marginBottom: '1.5rem',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Metrics Summary & Actions Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Locations: </span>
              <strong style={{ fontSize: '1.1rem' }}>{locations.length}</strong>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.8rem', color: '#166534' }}>Active Delivery: </span>
              <strong style={{ fontSize: '1.1rem', color: '#166534' }}>{activeCount}</strong>
            </div>
            <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <span style={{ fontSize: '0.8rem', color: '#991b1b' }}>Disabled Locations: </span>
              <strong style={{ fontSize: '1.1rem', color: '#991b1b' }}>{inactiveCount}</strong>
            </div>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontWeight: '500' }}>
            + Add Delivery Location
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: 'var(--bg-surface)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search by PIN, City, or State..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '0.5rem 0.8rem' }}
            />
          </div>
          <div style={{ width: '180px' }}>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '0.5rem 0.8rem' }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Locations Data Table */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading delivery locations database...
            </div>
          ) : locations.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No delivery locations found matching your criteria.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>PIN Code</th>
                  <th style={{ padding: '0.85rem 1rem' }}>City / District</th>
                  <th style={{ padding: '0.85rem 1rem' }}>State</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Delivery Charge</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Est. Days</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600' }}>{loc.pincode}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{loc.city}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{loc.state}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '500' }}>
                      {loc.delivery_charge > 0 ? formatCurrency(loc.delivery_charge) : 'FREE'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{loc.estimated_delivery_days} days</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          backgroundColor: loc.is_active ? '#dcfce7' : '#fee2e2',
                          color: loc.is_active ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {loc.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleActive(loc)}
                        style={{
                          marginRight: '0.5rem',
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.78rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          backgroundColor: loc.is_active ? '#fef2f2' : '#f0fdf4',
                          color: loc.is_active ? '#b91c1c' : '#15803d',
                        }}
                      >
                        {loc.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(loc)}
                        style={{
                          marginRight: '0.5rem',
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.78rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          backgroundColor: 'var(--bg-surface)',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingLoc(loc)}
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.78rem',
                          borderRadius: '4px',
                          border: '1px solid #fca5a5',
                          cursor: 'pointer',
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Location Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '12px',
              padding: '2rem',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <h3 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>
              {editingLoc ? `Edit Location (PIN ${editingLoc.pincode})` : 'Add New Delivery Location'}
            </h3>

            <form onSubmit={handleSaveLocation}>
              {!editingLoc && (
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                    PIN Code (6 Digits) <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="e.g. 560001"
                    className="form-input"
                    value={formData.pincode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pincode: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '0.5rem 0.8rem' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                    City / District <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '0.5rem 0.8rem' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                    State <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Karnataka"
                    className="form-input"
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '0.5rem 0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                    Delivery Charge (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="50.00"
                    className="form-input"
                    value={formData.delivery_charge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, delivery_charge: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem 0.8rem' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                    Estimated Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="3"
                    className="form-input"
                    value={formData.estimated_delivery_days}
                    onChange={(e) => setFormData((prev) => ({ ...prev, estimated_delivery_days: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem 0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  Enable delivery service for this location
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingLoc ? 'Save Changes' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingLoc && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '12px',
              padding: '2rem',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <h3 className="font-serif" style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#991b1b' }}>
              Confirm Delete Location
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete delivery location <strong>PIN {deletingLoc.pincode} ({deletingLoc.city})</strong>?
              Customers in this PIN code will no longer be able to place orders.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDeletingLoc(null)}
                className="btn btn-outline"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="btn btn-primary"
                style={{ backgroundColor: '#b91c1c', borderColor: '#b91c1c' }}
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Delete Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
