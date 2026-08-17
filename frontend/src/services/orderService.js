/**
 * PYHARA — Order Service Layer
 * 
 * Interacts with FastAPI Order REST API:
 * POST /api/orders
 * GET  /api/orders
 * GET  /api/orders/{id}
 * PUT  /api/orders/{id}/status
 */

import { getStoredToken } from './authService';

const getHost = () => (typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1');

function getAuthHeaders() {
  const token = getStoredToken();
  const headers = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function createOrder(orderPayload) {
  const host = getHost();
  const url = `http://${host}:8000/api/orders`;

  const res = await fetch(url, {
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
  const host = getHost();
  const url = `http://${host}:8000/api/orders/${encodeURIComponent(orderIdentifier)}`;

  const res = await fetch(url, {
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
  const host = getHost();
  const url = `http://${host}:8000/api/orders`;

  const res = await fetch(url, {
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
  const host = getHost();
  const url = `http://${host}:8000/api/orders/${encodeURIComponent(orderId)}/status`;

  const res = await fetch(url, {
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
