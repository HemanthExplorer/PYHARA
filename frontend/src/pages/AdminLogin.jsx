import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      navigate('/admin/products', { replace: true });
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(username.trim(), password.trim());
      if (user && user.is_admin) {
        navigate('/admin/products', { replace: true });
      } else {
        setErrorMessage('Invalid username or password.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setErrorMessage(err.message || 'Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h2 className="font-serif">Checking session...</h2>
      </div>
    );
  }

  return (
    <div className="admin-login-page section" style={{ paddingTop: '4rem' }}>
      <div className="container" style={{ maxWidth: '440px' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '2.5rem 2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="section-tag">Internal Access</span>
            <h1 className="font-serif" style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
              Administrator Login
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Sign in with your admin credentials to manage PYHARA catalog items and orders.
            </p>
          </div>

          {errorMessage && (
            <div
              style={{
                backgroundColor: 'rgba(184, 90, 60, 0.12)',
                border: '1px solid var(--color-clay)',
                color: 'var(--color-clay)',
                padding: '0.9rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                textAlign: 'center',
              }}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="admin-username" className="form-label">
                Username <span className="req">*</span>
              </label>
              <input
                type="text"
                id="admin-username"
                className="form-input"
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
                required
                autoFocus
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label htmlFor="admin-password" className="form-label">
                Password <span className="req">*</span>
              </label>
              <input
                type="password"
                id="admin-password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
