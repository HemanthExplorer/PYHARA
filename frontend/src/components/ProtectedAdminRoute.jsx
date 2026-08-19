import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h2 className="font-serif">Validating administrator session...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h1 className="font-serif" style={{ color: 'var(--color-clay)' }}>Access Denied</h1>
        <p className="section-description">
          Administrator privileges are required to access this internal management view.
        </p>
      </div>
    );
  }

  return children;
}
