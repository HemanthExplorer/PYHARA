/**
 * PYHARA — Admin Product Service Layer
 * 
 * Provides CRUD capabilities with stock_quantity & JWT Authorization against FastAPI:
 * GET    http://127.0.0.1:8000/api/products
 * POST   http://127.0.0.1:8000/api/products
 * PUT    http://127.0.0.1:8000/api/products/{id}
 * DELETE http://127.0.0.1:8000/api/products/{id}
 */

import { getStoredToken } from './authService';

const API_BASE_URL = 'http://127.0.0.1:8000/api/products';

function getAuthHeaders() {
  const token = getStoredToken();
  const headers = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function normalizeFromBackend(p) {
  if (!p) return null;
  return {
    ...p,
    altText: p.altText || p.alt_text || p.name || 'PYHARA product image',
    stock_quantity: p.stock_quantity !== undefined && p.stock_quantity !== null ? parseInt(p.stock_quantity, 10) : 0,
  };
}

export function normalizeToBackend(p) {
  if (!p) return {};
  const payload = { ...p };

  if (payload.altText !== undefined) {
    payload.alt_text = payload.altText;
    delete payload.altText;
  }

  if (payload.price === '' || payload.price === undefined) {
    payload.price = null;
  } else if (typeof payload.price === 'string') {
    const parsed = parseFloat(payload.price);
    payload.price = isNaN(parsed) ? null : parsed;
  }

  if (payload.stock_quantity === '' || payload.stock_quantity === undefined || payload.stock_quantity === null) {
    payload.stock_quantity = 0;
  } else {
    payload.stock_quantity = Math.max(0, parseInt(payload.stock_quantity, 10) || 0);
  }

  return payload;
}

export async function getAdminProducts() {
  const res = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to load products: HTTP ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeFromBackend) : [];
}

export async function createProduct(productData) {
  const payload = normalizeToBackend(productData);

  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail.map((e) => e.msg).join(', ');
        } else {
          errorDetail = errJson.detail;
        }
      }
    } catch {}
    const err = new Error(`Product creation failed: ${errorDetail}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  return normalizeFromBackend(data);
}

export async function updateProduct(id, productData) {
  const payload = normalizeToBackend(productData);

  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail.map((e) => e.msg).join(', ');
        } else {
          errorDetail = errJson.detail;
        }
      }
    } catch {}
    const err = new Error(`Product update failed: ${errorDetail}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  return normalizeFromBackend(data);
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch {}
    const err = new Error(`Product deletion failed: ${errorDetail}`);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}
