/**
 * PYHARA — Product Service Layer
 * 
 * Interacts with the FastAPI backend products API:
 * GET http://127.0.0.1:8000/api/products
 * GET http://127.0.0.1:8000/api/products/{id}
 * 
 * Normalizes backend field `alt_text` -> `altText` for frontend UI compatibility.
 */

import { DEMO_PRODUCTS, FUTURE_CATEGORIES } from '../data/products';

const API_BASE_URL = 'http://127.0.0.1:8000/api/products';

/**
 * Normalizes backend product schema (`alt_text`) to match frontend prop naming (`altText`).
 */
export function normalizeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    altText: p.altText || p.alt_text || p.name || 'PYHARA craft product',
  };
}

export async function getProducts() {
  try {
    const res = await fetch(API_BASE_URL, {
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

  try {
    const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
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
