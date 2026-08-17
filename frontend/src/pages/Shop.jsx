import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import {
  getProducts,
  searchProducts,
  filterProductsByCategory,
  sortProducts,
} from '../services/productService';
import { useCart } from '../context/CartContext';

export default function Shop() {
  const { showToast } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');

  const categories = [
    { name: 'All', active: true },
    { name: 'Ganesh Idols', active: true },
    { name: 'Traditional Clothing', active: false },
    { name: 'Plants & Green Living', active: false },
    { name: 'Home & Craft', active: false },
    { name: 'Conscious Gifting', active: false },
  ];

  const fetchProductsList = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products from API:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductsList();
  }, [fetchProductsList]);

  const handleCategoryClick = (cat) => {
    if (!cat.active) {
      showToast(`"${cat.name}" is coming soon to PYHARA.`);
      return;
    }
    setSelectedCategory(cat.name);
  };

  const processedProducts = useMemo(() => {
    let result = products;
    // 1. Filter by category
    result = filterProductsByCategory(result, selectedCategory);
    // 2. Filter by search query
    result = searchProducts(searchQuery, result);
    // 3. Sort
    result = sortProducts(result, sortBy);
    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="shop-page section" style={{ paddingTop: '3rem' }}>
      <div className="container">
        {/* Shop Introduction Banner */}
        <div className="shop-banner">
          <span className="section-tag">Marketplace Catalog</span>
          <h1 className="shop-title font-serif">Discover PYHARA</h1>
          <p className="shop-description">
            Thoughtfully chosen products rooted in culture, craftsmanship and respect for nature.
          </p>
        </div>

        {/* Toolbar: Search, Category Filters, Sort */}
        <div className="shop-toolbar">
          {/* In-page Search Bar */}
          <div className="shop-search-wrapper">
            <svg className="shop-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="shop-search-input"
              placeholder="Search products by name, clay, or craft..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search shop products"
              disabled={loading || error}
            />
            {searchQuery && (
              <button className="shop-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                &times;
              </button>
            )}
          </div>

          {/* Sort Dropdown Control */}
          <div className="shop-sort-wrapper">
            <label htmlFor="shop-sort-select" className="sort-label">Sort by:</label>
            <select
              id="shop-sort-select"
              className="shop-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={loading || error}
            >
              <option value="Featured">Featured</option>
              <option value="Name: A–Z">Name: A–Z</option>
              <option value="Name: Z–A">Name: Z–A</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="category-pills-row" role="tablist" aria-label="Category Filters">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                className={`category-pill ${isSelected ? 'selected' : ''} ${!cat.active ? 'coming-soon' : ''}`}
                onClick={() => handleCategoryClick(cat)}
                role="tab"
                aria-selected={isSelected}
                disabled={loading || error}
              >
                {cat.name}
                {!cat.active && <span className="pill-badge">Soon</span>}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="shop-empty-state" style={{ padding: '5rem 1rem' }}>
            <h3 className="empty-title">Loading products...</h3>
            <p className="empty-desc">Fetching the latest catalog from PYHARA servers.</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="shop-empty-state" style={{ padding: '5rem 1rem' }}>
            <h3 className="empty-title" style={{ color: 'var(--color-clay)' }}>
              Unable to load products. Please try again.
            </h3>
            <p className="empty-desc">
              We couldn't connect to the backend server. Please verify your network or server status.
            </p>
            <button
              className="btn btn-primary"
              onClick={fetchProductsList}
              style={{ marginTop: '1.5rem' }}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Product Grid & Empty State */}
        {!loading && !error && processedProducts.length === 0 && (
          <div className="shop-empty-state">
            <h3 className="empty-title">No products found.</h3>
            <p className="empty-desc">
              Try adjusting your search term or selecting a different category.
            </p>
            <button
              className="btn btn-outline-clay"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              style={{ marginTop: '1rem' }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {!loading && !error && processedProducts.length > 0 && (
          <div className="products-grid" style={{ marginTop: '2.5rem' }}>
            {processedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
