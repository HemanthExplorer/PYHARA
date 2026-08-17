/**
 * PYHARA — Order Service Layer
 * 
 * Interacts with FastAPI Order REST API:
 * POST http://127.0.0.1:8000/api/orders
 * GET  http://127.0.0.1:8000/api/orders
 * GET  http://127.0.0.1:8000/api/orders/{id}
 * PUT  http://127.0.0.1:8000/api/orders/{id}/status
 */

import { getStoredToken } from './authService';

const API_BASE_URL = 'http://127.0.0.1:8000/api/orders';

function getAuthHeaders() {
  const token = getStoredToken();
  const headers = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function createOrder(orderPayload) {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(orderPayload),
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

    const err = new Error(errorDetail);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}

export async function getOrderById(orderIdentifier) {
  if (!orderIdentifier) return null;

  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(orderIdentifier)}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to load order: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function getAdminOrders() {
  const res = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to load orders list: HTTP ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function updateOrderStatus(orderId, newStatus) {
  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(orderId)}/status`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {}

    const err = new Error(errorDetail);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}
