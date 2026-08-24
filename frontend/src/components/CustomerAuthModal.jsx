import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CustomerAuthModal() {
  const { isAuthModalOpen, authModalInitialTab, closeAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState(authModalInitialTab || 'login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter email/username and password.');
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      closeAuthModal();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!regFullName || !regEmail || !regPhone || !regPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(regFullName, regEmail, regPhone, regPassword);
      closeAuthModal();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal} id="customer-auth-modal">
      <div className="modal-container auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeAuthModal} aria-label="Close modal">
          &times;
        </button>

        <div className="auth-modal-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setErrorMsg(''); }}
          >
            Log In
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setErrorMsg(''); }}
          >
            Create Account
          </button>
        </div>

        {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <h3 className="auth-title">Welcome Back to PYHARA</h3>
            <p className="auth-subtitle">Log in to track orders, manage addresses & wishlist.</p>

            <div className="form-group">
              <label>Email or Username</label>
              <input
                type="text"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <h3 className="auth-title">Join PYHARA Eco-Marketplace</h3>
            <p className="auth-subtitle">Create a customer account for seamless sustainable shopping.</p>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Your Full Name"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number (10 digits)</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password (min 6 characters)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
