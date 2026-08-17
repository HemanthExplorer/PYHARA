import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { DEMO_PRODUCTS } from '../data/products';

export default function SearchModal() {
  const { isSearchOpen, closeSearch, openProductDetail } = useCart();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  if (!isSearchOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();

  const filteredProducts = normalizedQuery
    ? DEMO_PRODUCTS.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(normalizedQuery);
        const descMatch = p.description?.toLowerCase().includes(normalizedQuery);
        const catMatch = p.category?.toLowerCase().includes(normalizedQuery);
        const matMatch = p.material?.toLowerCase().includes(normalizedQuery);
        return nameMatch || descMatch || catMatch || matMatch;
      })
    : DEMO_PRODUCTS;

  const handleSelectProduct = (product) => {
    closeSearch();
    openProductDetail(product);
  };

  return (
    <div className="modal-backdrop" onClick={closeSearch} role="dialog" aria-modal="true" aria-label="Search PYHARA Collection">
      <div className="search-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="search-modal-header">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="Search by name, clay, craft, or category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            {query && (
              <button className="search-clear-btn" onClick={() => setQuery('')} aria-label="Clear search">
                &times;
              </button>
            )}
          </div>
          <button className="modal-close-btn" onClick={closeSearch} aria-label="Close search dialog">
            &times;
          </button>
        </div>

        {/* Results Body */}
        <div className="search-results-body">
          {filteredProducts.length === 0 ? (
            <div className="search-empty-state">
              <p className="empty-title">No products found.</p>
              <p className="empty-desc">Try searching for terms like "ganesh", "earth", "artisan", or "clay".</p>
            </div>
          ) : (
            <div className="search-results-grid">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="search-result-item"
                  onClick={() => handleSelectProduct(product)}
                >
                  <img src={product.image} alt={product.name} className="search-result-img" />
                  <div className="search-result-info">
                    <span className="search-result-cat">{product.category}</span>
                    <h4 className="search-result-title">{product.name}</h4>
                    <span className="search-result-mat">{product.material}</span>
                  </div>
                  <button className="btn btn-outline-clay btn-sm" onClick={(e) => { e.stopPropagation(); handleSelectProduct(product); }}>
                    View Product
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
