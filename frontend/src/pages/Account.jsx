import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import * as addressService from '../services/addressService';
import * as orderService from '../services/orderService';
import * as wishlistService from '../services/wishlistService';

export default function Account() {
  const { user, isAuthenticated, logout, updateProfile, openAuthModal } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'addresses', 'wishlist', 'profile'
  
  // Data states
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [addrForm, setAddrForm] = useState({
    full_name: '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    label: 'Home',
    is_default: false,
  });

  // Profile Form State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const loadAccountData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [orderList, addrList, wishList] = await Promise.all([
        orderService.getCustomerMyOrders().catch(() => []),
        addressService.getUserAddresses().catch(() => []),
        wishlistService.getWishlist().catch(() => []),
      ]);
      setOrders(orderList);
      setAddresses(addrList);
      setWishlist(wishList);
    } catch (err) {
      console.error('Failed to load account data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login');
      navigate('/');
    } else {
      loadAccountData();
      if (user) {
        setProfileName(user.full_name || '');
        setProfilePhone(user.phone || '');
      }
    }
  }, [isAuthenticated, user, loadAccountData, navigate, openAuthModal]);

  const showToast = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  // Address Handlers
  const handleOpenAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddr(addr);
      setAddrForm({
        full_name: addr.full_name,
        phone: addr.phone,
        address_line: addr.address_line,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country || 'India',
        label: addr.label || 'Home',
        is_default: addr.is_default,
      });
    } else {
      setEditingAddr(null);
      setAddrForm({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        address_line: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        label: 'Home',
        is_default: addresses.length === 0,
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddr) {
        await addressService.updateAddress(editingAddr.id, addrForm);
        showToast('success', 'Address updated successfully.');
      } else {
        await addressService.createAddress(addrForm);
        showToast('success', 'New address added.');
      }
      setIsAddressModalOpen(false);
      loadAccountData();
    } catch (err) {
      showToast('error', err.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await addressService.deleteAddress(id);
      showToast('success', 'Address deleted.');
      loadAccountData();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await addressService.setDefaultAddress(id);
      showToast('success', 'Default address updated.');
      loadAccountData();
    } catch (err) {
      showToast('error', err.message || 'Failed to set default address.');
    }
  };

  // Wishlist Handlers
  const handleRemoveWishlist = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((item) => item.product_id !== productId));
      showToast('success', 'Removed from wishlist.');
    } catch (err) {
      showToast('error', 'Failed to remove from wishlist.');
    }
  };

  const handleMoveToCart = async (product) => {
    addToCart(product, 1);
    await handleRemoveWishlist(product.id);
    showToast('success', `${product.name} moved to cart!`);
  };

  // Order Cancellation Handler
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderService.cancelCustomerOrder(orderId);
      showToast('success', 'Order cancelled successfully.');
      loadAccountData();
    } catch (err) {
      showToast('error', err.message || 'Failed to cancel order.');
    }
  };

  // Profile Update Handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: profileName,
        phone: profilePhone,
        current_password: currPassword || undefined,
        new_password: newPassword || undefined,
      });
      setCurrPassword('');
      setNewPassword('');
      showToast('success', 'Profile updated successfully.');
    } catch (err) {
      showToast('error', err.message || 'Failed to update profile.');
    }
  };

  if (!user) return null;

  return (
    <div className="account-page page-container">
      <div className="account-header">
        <h1>My Account</h1>
        <p className="account-welcome">Welcome back, <strong>{user.full_name || user.username}</strong> ({user.email})</p>
      </div>

      {msg.text && (
        <div className={`toast-banner toast-${msg.type}`}>
          {msg.text}
        </div>
      )}

      <div className="account-layout">
        {/* Sidebar Nav */}
        <aside className="account-sidebar">
          <button
            className={`account-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 My Orders ({orders.length})
          </button>

          <button
            className={`account-nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            🏠 Saved Addresses ({addresses.length})
          </button>

          <button
            className={`account-nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            ❤️ My Wishlist ({wishlist.length})
          </button>

          <button
            className={`account-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Personal Info & Security
          </button>

          <button className="account-nav-btn logout-btn" onClick={logout}>
            🚪 Log Out
          </button>
        </aside>

        {/* Content Area */}
        <main className="account-content">
          {loading ? (
            <div className="loading-spinner">Loading account details...</div>
          ) : (
            <>
              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="tab-pane">
                  <h2>Order History</h2>
                  {orders.length === 0 ? (
                    <div className="empty-state">
                      <p>You haven't placed any orders yet.</p>
                      <button className="btn-primary" onClick={() => navigate('/shop')}>Browse Products</button>
                    </div>
                  ) : (
                    <div className="orders-list">
                      {orders.map((ord) => (
                        <div key={ord.id} className="order-card">
                          <div className="order-card-header">
                            <div>
                              <span className="order-num">Order #{ord.order_number}</span>
                              <span className="order-date">Placed on {new Date(ord.created_at).toLocaleDateString('en-IN')}</span>
                            </div>
                            <span className={`status-badge status-${ord.status.toLowerCase()}`}>{ord.status}</span>
                          </div>

                          <div className="order-card-body">
                            <div className="order-items">
                              {ord.items.map((item) => (
                                <div key={item.id} className="order-item-row">
                                  <span className="item-name">{item.product_name} x {item.quantity}</span>
                                  <span className="item-price">₹{item.line_total ? Number(item.line_total).toLocaleString('en-IN') : 'TBD'}</span>
                                </div>
                              ))}
                            </div>

                            <div className="order-summary-row">
                              <div>
                                <span className="meta-label">Shipping Address:</span>
                                <p className="meta-val">{ord.shipping_address}, {ord.city}, {ord.state} - {ord.pincode}</p>
                              </div>
                              <div className="text-right">
                                <span className="meta-label">Total Amount:</span>
                                <p className="order-total-price">₹{ord.total_amount ? Number(ord.total_amount).toLocaleString('en-IN') : 'TBD'}</p>
                                <span className={`payment-tag ${ord.payment_status === 'Paid' ? 'paid' : 'pending'}`}>
                                  {ord.payment_method} ({ord.payment_status})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="order-card-footer">
                            <button
                              className="btn-outline btn-sm"
                              onClick={() => navigate(`/order-tracking?orderId=${ord.order_number}`)}
                            >
                              Track Order Details
                            </button>

                            {(ord.status === 'Pending' || ord.status === 'Confirmed') && (
                              <button
                                className="btn-danger-outline btn-sm"
                                onClick={() => handleCancelOrder(ord.id)}
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Saved Addresses</h2>
                    <button className="btn-primary btn-sm" onClick={() => handleOpenAddressModal()}>
                      + Add New Address
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="empty-state">
                      <p>No saved addresses found. Add one for 1-click checkout!</p>
                    </div>
                  ) : (
                    <div className="addresses-grid">
                      {addresses.map((addr) => (
                        <div key={addr.id} className={`address-card ${addr.is_default ? 'default-card' : ''}`}>
                          <div className="addr-card-top">
                            <span className="addr-label">{addr.label}</span>
                            {addr.is_default && <span className="default-badge">Default</span>}
                          </div>
                          <h4>{addr.full_name}</h4>
                          <p>{addr.address_line}</p>
                          <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p>Phone: {addr.phone}</p>

                          <div className="addr-card-actions">
                            {!addr.is_default && (
                              <button className="btn-link" onClick={() => handleSetDefaultAddress(addr.id)}>Set Default</button>
                            )}
                            <button className="btn-link" onClick={() => handleOpenAddressModal(addr)}>Edit</button>
                            <button className="btn-link text-danger" onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* WISHLIST TAB */}
              {activeTab === 'wishlist' && (
                <div className="tab-pane">
                  <h2>My Saved Wishlist</h2>
                  {wishlist.length === 0 ? (
                    <div className="empty-state">
                      <p>Your wishlist is empty.</p>
                      <button className="btn-primary" onClick={() => navigate('/shop')}>Discover Eco Products</button>
                    </div>
                  ) : (
                    <div className="wishlist-grid">
                      {wishlist.map((item) => (
                        <div key={item.id} className="wishlist-card">
                          <img src={item.product.image || '/images/products/placeholder.jpg'} alt={item.product.name} />
                          <div className="wishlist-card-content">
                            <h4>{item.product.name}</h4>
                            <p className="price">₹{item.product.price ? Number(item.product.price).toLocaleString('en-IN') : 'TBD'}</p>
                            <div className="wishlist-actions">
                              <button className="btn-primary btn-sm" onClick={() => handleMoveToCart(item.product)}>
                                Add to Cart
                              </button>
                              <button className="btn-outline btn-sm text-danger" onClick={() => handleRemoveWishlist(item.product_id)}>
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="tab-pane">
                  <h2>Personal Information & Security</h2>
                  <form onSubmit={handleProfileSubmit} className="profile-form">
                    <div className="form-group">
                      <label>Email Address (read-only)</label>
                      <input type="email" value={user.email} disabled className="input-disabled" />
                    </div>

                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        required
                      />
                    </div>

                    <hr className="divider" />
                    <h3>Change Password (optional)</h3>

                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currPassword}
                        onChange={(e) => setCurrPassword(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn-primary">Save Profile Changes</button>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Address Form Modal */}
      {isAddressModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddressModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h3>{editingAddr ? 'Edit Saved Address' : 'Add New Shipping Address'}</h3>
            <form onSubmit={handleSaveAddress} className="addr-modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={addrForm.full_name}
                  onChange={(e) => setAddrForm({ ...addrForm, full_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={addrForm.phone}
                  onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Address Line</label>
                <input
                  type="text"
                  required
                  placeholder="House No, Street, Landmark"
                  value={addrForm.address_line}
                  onChange={(e) => setAddrForm({ ...addrForm, address_line: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    required
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    required
                    value={addrForm.state}
                    onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>PIN Code (6 digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addrForm.pincode}
                    onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address Label</label>
                <select
                  value={addrForm.label}
                  onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={addrForm.is_default}
                    onChange={(e) => setAddrForm({ ...addrForm, is_default: e.target.checked })}
                  />
                  Set as my default shipping address
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setIsAddressModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
