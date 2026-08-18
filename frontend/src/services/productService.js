/**
 * PYHARA — Product Service Layer
 * 
 * Interacts with the FastAPI backend products API:
 * GET /api/products
 * GET /api/products/{id}
 * 
 * Normalizes backend field `alt_text` -> `altText` and preserves `stock_quantity`.
 */

import { DEMO_PRODUCTS, FUTURE_CATEGORIES } from '../data/products';
import { API_BASE_URL } from '../config';

/**
 * Normalizes backend product schema (`alt_text`) to match frontend prop naming (`altText`).
 */
export function normalizeProduct(p) {
  if (!p) return null;
  const stockQty = p.stock_quantity !== undefined && p.stock_quantity !== null ? p.stock_quantity : 0;
  
  // Compute display status
  let computedAvailability = p.availability;
  if (p.availability !== 'Coming Soon') {
    computedAvailability = stockQty > 0 ? 'In Stock' : 'Out of Stock';
  }

  return {
    ...p,
    altText: p.altText || p.alt_text || p.name || 'PYHARA craft product',
    stock_quantity: stockQty,
    availability: computedAvailability,
  };
}

export async function getProducts() {
  const url = `${API_BASE_URL}/api/products`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`API returned HTTP status ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map(normalizeProduct);
    }
    return [];
  } catch (err) {
    console.warn('FastAPI backend request failed, falling back to local dataset:', err.message);
    throw err;
  }
}

export async function getProductById(id) {
  if (!id) return null;
  const url = `${API_BASE_URL}/api/products/${encodeURIComponent(id)}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`API returned HTTP status ${res.status}`);
    }

    const data = await res.json();
    return normalizeProduct(data);
  } catch (err) {
    console.warn(`FastAPI backend request for ID ${id} failed:`, err.message);
    throw err;
  }
}

export function getFutureCategories() {
  return FUTURE_CATEGORIES;
}

export function searchProducts(query, products = []) {
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

export function filterProductsByCategory(products = [], category) {
  if (!category || category === 'All') return products;
  return products.filter((p) => p.category === category);
}

export function sortProducts(products = [], sortBy = 'Featured') {
  const sorted = [...products];
  if (sortBy === 'Name: A–Z') {
    sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (sortBy === 'Name: Z–A') {
    sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  }
  return sorted;
}

export function getRelatedProducts(products = [], currentProductId, category, limit = 3) {
  return products
    .filter((p) => p.id !== currentProductId && (category ? p.category === category : true))
    .slice(0, limit);
}
