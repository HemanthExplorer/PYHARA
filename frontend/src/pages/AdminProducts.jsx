import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/adminProductService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function AdminProducts() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    category: 'Ganesh Idols',
    material: '',
    availability: 'In Stock',
    stock_quantity: 5,
    image: '/images/products/',
    altText: '',
    badge: 'First Collection',
  });

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load admin products:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Escape key to close open modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFormModalOpen && !saving) setIsFormModalOpen(false);
        if (deleteTarget && !deleting) setDeleteTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormModalOpen, saving, deleteTarget, deleting]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      name: '',
      description: '',
      price: '',
      category: 'Ganesh Idols',
      material: '',
      availability: 'In Stock',
      stock_quantity: 5,
      image: '/images/products/classic-ganesh.jpg',
      altText: '',
      badge: 'First Collection',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setIsEditing(true);
    setFormData({
      id: prod.id,
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price !== null && prod.price !== undefined ? String(prod.price) : '',
      category: prod.category || 'Ganesh Idols',
      material: prod.material || '',
      availability: prod.availability || 'In Stock',
      stock_quantity: prod.stock_quantity !== undefined ? prod.stock_quantity : 0,
      image: prod.image || '/images/products/',
      altText: prod.altText || prod.alt_text || '',
      badge: prod.badge || '',
    });
    setIsFormModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Required Field Validations
    if (!formData.id.trim()) {
      showToast('Product ID is required.');
      return;
    }
    if (!formData.name.trim()) {
      showToast('Product Name is required.');
      return;
    }
    if (!formData.description.trim()) {
      showToast('Description is required.');
      return;
    }
    if (!formData.category.trim()) {
      showToast('Category is required.');
      return;
    }
    if (!formData.material.trim()) {
      showToast('Material is required.');
      return;
    }
    if (!formData.availability.trim()) {
      showToast('Availability is required.');
      return;
    }
    if (!formData.image.trim()) {
      showToast('Image path is required.');
      return;
    }
    if (!formData.altText.trim()) {
      showToast('Alt Text is required.');
      return;
    }

    const stockQtyNum = parseInt(formData.stock_quantity, 10);
    if (isNaN(stockQtyNum) || stockQtyNum < 0) {
      showToast('Stock Quantity must be a non-negative integer.');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        // Send payload for PUT /api/products/{id}
        await updateProduct(formData.id, {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          material: formData.material,
          availability: formData.availability,
          stock_quantity: stockQtyNum,
          image: formData.image,
          altText: formData.altText,
          badge: formData.badge,
        });
        showToast('Product updated successfully.');
      } else {
        // Send payload for POST /api/products
        await createProduct({ ...formData, stock_quantity: stockQtyNum });
        showToast('Product created successfully.');
      }
      setIsFormModalOpen(false);
      await fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      showToast(err.message || 'Operation failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      showToast('Product deleted successfully.');
      setDeleteTarget(null);
      await fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast(err.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
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
            <Link to="/admin/products" className="btn btn-primary btn-sm">
              Products
            </Link>
            <Link to="/admin/orders" className="btn btn-secondary btn-sm">
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

        {/* Page Header */}
        <div className="admin-header-row">
          <div>
            <span className="section-tag">Internal Management</span>
            <h1 className="admin-title font-serif">Admin Product &amp; Stock Management</h1>
            <p className="admin-subtitle">
              Manage catalog items, track stock quantities, update specifications, or remove items.
            </p>
          </div>

          <div className="admin-header-actions">
            <button className="btn btn-secondary" onClick={fetchProducts} disabled={loading}>
              Refresh Products
            </button>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              + Add Product
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="shop-empty-state" style={{ padding: '5rem 1rem', marginTop: '2rem' }}>
            <h3 className="empty-title">Loading products...</h3>
            <p className="empty-desc">Fetching catalog and inventory data from FastAPI server.</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="shop-empty-state" style={{ padding: '5rem 1rem', marginTop: '2rem' }}>
            <h3 className="empty-title" style={{ color: 'var(--color-clay)' }}>
              Unable to load products. Please try again.
            </h3>
            <p className="empty-desc">Couldn't fetch catalog items from backend server.</p>
            <button className="btn btn-primary" onClick={fetchProducts} style={{ marginTop: '1.5rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* Product Table View */}
        {!loading && !error && (
          <div className="admin-table-wrapper" style={{ marginTop: '2.5rem' }}>
            {products.length === 0 ? (
              <div className="shop-empty-state">
                <h3 className="empty-title">No products found in database.</h3>
                <p className="empty-desc">Click "+ Add Product" above to create your first item.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>ID / Name</th>
                      <th>Category</th>
                      <th>Material</th>
                      <th>Stock Qty</th>
                      <th>Status</th>
                      <th>Price</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => {
                      const priceLabel =
                        prod.price !== null && prod.price !== undefined
                          ? `₹ ${prod.price}`
                          : 'Price coming soon';
                      
                      const isComingSoon = prod.availability === 'Coming Soon';
                      const isInStock = !isComingSoon && prod.stock_quantity > 0;
                      const statusClass = isComingSoon ? 'admin-tag-soon' : (isInStock ? 'admin-tag-avail' : 'admin-tag-out');
                      const statusText = isComingSoon ? 'Coming Soon' : (isInStock ? 'In Stock' : 'Out of Stock');

                      return (
                        <tr key={prod.id}>
                          <td>
                            <div className="admin-thumb-wrapper">
                              <img src={prod.image} alt={prod.altText || prod.name} className="admin-thumb-img" />
                            </div>
                          </td>
                          <td>
                            <div className="admin-prod-name">{prod.name}</div>
                            <div className="admin-prod-id">ID: {prod.id}</div>
                          </td>
                          <td>
                            <span className="admin-tag-cat">{prod.category}</span>
                          </td>
                          <td className="admin-text-muted">{prod.material}</td>
                          <td style={{ fontWeight: '700' }}>
                            {prod.stock_quantity} units
                          </td>
                          <td>
                            <span className={statusClass}>{statusText}</span>
                          </td>
                          <td className="admin-price-cell">{priceLabel}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="admin-action-btn-group">
                              <button
                                className="btn btn-sm btn-outline-clay"
                                onClick={() => handleOpenEdit(prod)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => setDeleteTarget(prod)}
                                style={{ color: '#b85a3c', borderColor: 'rgba(184, 90, 60, 0.4)' }}
                              >
                                Delete
                              </button>
                            </div>
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

      {/* Add / Edit Product Modal */}
      {isFormModalOpen && (
        <div className="modal-backdrop" onClick={() => !saving && setIsFormModalOpen(false)}>
          <div
            className="admin-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={isEditing ? 'Edit Product' : 'Add New Product'}
          >
            <button
              className="modal-close-btn"
              onClick={() => !saving && setIsFormModalOpen(false)}
              aria-label="Close form modal"
              disabled={saving}
            >
              &times;
            </button>

            <div className="admin-modal-header">
              <h2 className="admin-modal-title font-serif">
                {isEditing ? 'Edit Product & Inventory' : 'Add New Product'}
              </h2>
              <p className="admin-modal-sub">
                {isEditing
                  ? `Updating specifications and stock for ID: ${formData.id}`
                  : 'Enter product specifications and initial stock count.'}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-body">
              <div className="admin-form-grid">
                <div className="form-group">
                  <label htmlFor="prod-id" className="form-label">
                    Product ID <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="prod-id"
                    name="id"
                    className="form-input"
                    placeholder="e.g. classic-ganesh"
                    value={formData.id}
                    onChange={handleFormChange}
                    disabled={isEditing || saving}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-name" className="form-label">
                    Product Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="prod-name"
                    name="name"
                    className="form-input"
                    placeholder="e.g. The Classic Ganesh"
                    value={formData.name}
                    onChange={handleFormChange}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-category" className="form-label">
                    Category <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="prod-category"
                    name="category"
                    className="form-input"
                    placeholder="e.g. Ganesh Idols"
                    value={formData.category}
                    onChange={handleFormChange}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-material" className="form-label">
                    Material <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="prod-material"
                    name="material"
                    className="form-input"
                    placeholder="e.g. Natural clay formulation"
                    value={formData.material}
                    onChange={handleFormChange}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-availability" className="form-label">
                    Availability <span className="req">*</span>
                  </label>
                  <select
                    id="prod-availability"
                    name="availability"
                    className="form-input"
                    value={formData.availability}
                    onChange={handleFormChange}
                    disabled={saving}
                    required
                  >
                    <option value="In Stock">In Stock / Normal</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="prod-stock" className="form-label">
                    Stock Quantity <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="prod-stock"
                    name="stock_quantity"
                    className="form-input"
                    placeholder="e.g. 10"
                    value={formData.stock_quantity}
                    onChange={handleFormChange}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-price" className="form-label">
                    Price (₹) <span className="opt">(Optional - leave blank for null)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="prod-price"
                    name="price"
                    className="form-input"
                    placeholder="Leave empty for 'Price coming soon'"
                    value={formData.price}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-badge" className="form-label">
                    Badge <span className="opt">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="prod-badge"
                    name="badge"
                    className="form-input"
                    placeholder="e.g. First Collection"
                    value={formData.badge}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="prod-image" className="form-label">
                    Image Path <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="prod-image"
                    name="image"
                    className="form-input"
                    placeholder="e.g. /images/products/classic-ganesh.jpg"
                    value={formData.image}
                    onChange={handleFormChange}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="prod-alt" className="form-label">
                    Alt Text <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="prod-alt"
                    name="altText"
                    className="form-input"
                    placeholder="e.g. Preview of The Classic Ganesh idol"
                    value={formData.altText}
                    onChange={handleFormChange}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="prod-description" className="form-label">
                    Description <span className="req">*</span>
                  </label>
                  <textarea
                    id="prod-description"
                    name="description"
                    rows="3"
                    className="form-input"
                    placeholder="Detailed product specifications..."
                    value={formData.description}
                    onChange={handleFormChange}
                    disabled={saving}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div
            className="admin-dialog-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Product Deletion"
          >
            <h3 className="dialog-title font-serif">Confirm Deletion</h3>
            <p className="dialog-message">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong> (ID: {deleteTarget.id})? This action cannot be undone.
            </p>

            <div className="dialog-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                style={{ backgroundColor: '#b85a3c', borderColor: '#b85a3c' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
