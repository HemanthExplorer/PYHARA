/**
 * PYHARA — Admin Product Service Layer
 * 
 * Provides CRUD capabilities with stock_quantity against FastAPI:
 * GET    http://127.0.0.1:8000/api/products
 * POST   http://127.0.0.1:8000/api/products
 * PUT    http://127.0.0.1:8000/api/products/{id}
 * DELETE http://127.0.0.1:8000/api/products/{id}
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api/products';

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

  // Map altText -> alt_text for API consumption
  if (payload.altText !== undefined) {
    payload.alt_text = payload.altText;
    delete payload.altText;
  }

  // Convert empty string price to null
  if (payload.price === '' || payload.price === undefined) {
    payload.price = null;
  } else if (typeof payload.price === 'string') {
    const parsed = parseFloat(payload.price);
    payload.price = isNaN(parsed) ? null : parsed;
  }

  // Convert stock_quantity to non-negative integer
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
    headers: { 'Accept': 'application/json' },
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
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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
    throw new Error(`Product creation failed: ${errorDetail}`);
  }

  const data = await res.json();
  return normalizeFromBackend(data);
}

export async function updateProduct(id, productData) {
  const payload = normalizeToBackend(productData);

  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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
    throw new Error(`Product update failed: ${errorDetail}`);
  }

  const data = await res.json();
  return normalizeFromBackend(data);
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch {}
    throw new Error(`Product deletion failed: ${errorDetail}`);
  }

  return await res.json();
}
