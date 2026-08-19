/**
 * PYHARA — Order Service Layer
 * 
 * Interacts with FastAPI Order REST API:
 * POST /api/orders
 * GET  /api/orders
 * GET  /api/orders/{id}
 * PUT  /api/orders/{id}/cancel
 * PUT  /api/orders/{id}/status
 */

import { getStoredToken } from './authService';
import { API_BASE_URL } from '../config';

function getAuthHeaders() {
  const token = getStoredToken();
  const headers = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function createOrder(orderPayload) {
  const url = `${API_BASE_URL}/api/orders`;

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
  const url = `${API_BASE_URL}/api/orders/${encodeURIComponent(orderIdentifier)}`;

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

export async function cancelCustomerOrder(orderId) {
  const url = `${API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}/cancel`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Accept': 'application/json' },
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

export async function getAdminOrders() {
  const url = `${API_BASE_URL}/api/orders`;

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
  const url = `${API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}/status`;

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

export async function markCodPaid(orderId) {
  const url = `${API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}/mark-cod-paid`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
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

