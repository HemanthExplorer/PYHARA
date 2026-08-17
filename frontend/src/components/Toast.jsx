import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toastMessage, hideToast } = useCart();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!toastMessage) return null;

  return (
    <div className="toast-notification" role="status" aria-live="polite">
      <div className="toast-content">
        <span className="toast-text">{toastMessage}</span>
        <button className="toast-close" onClick={hideToast} aria-label="Close notification">
          &times;
        </button>
      </div>
    </div>
  );
}
