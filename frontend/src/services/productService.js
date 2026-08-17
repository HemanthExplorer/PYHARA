/**
 * PYHARA — Product Service Layer
 * 
 * Centralizes data fetching and manipulation logic.
 * Currently reads from products.js mock data.
 * Designed to seamlessly transition to REST API endpoints (GET /api/products) in future milestones.
 */

import { DEMO_PRODUCTS, FUTURE_CATEGORIES } from '../data/products';

export function getProducts() {
  return DEMO_PRODUCTS;
}

export function getProductById(id) {
  if (!id) return null;
  return DEMO_PRODUCTS.find((p) => p.id === id) || null;
}

export function getFutureCategories() {
  return FUTURE_CATEGORIES;
}

export function getRelatedProducts(currentProductId, category, limit = 3) {
  return DEMO_PRODUCTS.filter(
    (p) => p.id !== currentProductId && (category ? p.category === category : true)
  ).slice(0, limit);
}

export function searchProducts(query, products = DEMO_PRODUCTS) {
  if (!query || !query.trim()) return products;
  const q = query.trim().toLowerCase();
  return products.filter(
    (p) =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.material?.toLowerCase().includes(q)
  );
}

export function filterProductsByCategory(category, products = DEMO_PRODUCTS) {
  if (!category || category === 'All') return products;
  return products.filter((p) => p.category === category);
}

export function sortProducts(products, sortBy = 'Featured') {
  const sorted = [...products];
  if (sortBy === 'Name: A–Z') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'Name: Z–A') {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  }
  // 'Featured' preserves default order from products.js
  return sorted;
}
