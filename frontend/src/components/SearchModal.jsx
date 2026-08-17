import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProducts, searchProducts } from '../services/productService';
import { DEMO_PRODUCTS } from '../data/products';

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useCart();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      let isMounted = true;
      getProducts()
        .then((data) => {
          if (isMounted && data && data.length > 0) {
            setProducts(data);
          }
        })
        .catch(() => {
          // Fallback to DEMO_PRODUCTS seamlessly
        });
      return () => {
        isMounted = false;
      };
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const results = searchProducts(query, products);

  const handleSelectProduct = (productId) => {
    closeSearch();
    setQuery('');
    navigate(`/product/${productId}`);
  };

  return (
    <div className="modal-backdrop" onClick={closeSearch}>
      <div
        className="search-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search PYHARA catalog"
      >
        <button className="modal-close-btn" onClick={closeSearch} aria-label="Close search modal">
          &times;
        </button>

        <div className="search-modal-header">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, category, or material..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button className="search-clear-btn" onClick={() => setQuery('')} aria-label="Clear search">
                &times;
              </button>
            )}
          </div>
        </div>

        <div className="search-results-body">
          {query.trim() !== '' && results.length === 0 ? (
            <div className="search-empty-state">
              <h3 className="empty-title">No products found.</h3>
              <p className="empty-desc">We couldn't find anything matching "{query}".</p>
            </div>
          ) : (
            <div className="search-results-grid">
              {(query.trim() === '' ? products : results).map((product) => (
                <div
                  key={product.id}
                  className="search-result-item"
                  onClick={() => handleSelectProduct(product.id)}
                >
                  <img
                    src={product.image}
                    alt={product.altText || product.name}
                    className="search-result-img"
                  />
                  <div className="search-result-info">
                    <span className="search-result-cat">{product.category}</span>
                    <h4 className="search-result-title">{product.name}</h4>
                    <span className="search-result-mat">{product.material}</span>
                  </div>
                  <span className="btn btn-sm btn-outline-clay">View</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
