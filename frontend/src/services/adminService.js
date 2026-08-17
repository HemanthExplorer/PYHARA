/**
 * PYHARA — Admin Dashboard Service Layer
 * 
 * Interacts with FastAPI Admin REST API:
 * GET /api/admin/dashboard
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

export async function getDashboardStats() {
  const host = getHost();
  const url = `http://${host}:8000/api/admin/dashboard`;

  const res = await fetch(url, {
    method: 'GET',
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
    const err = new Error(`Failed to load dashboard metrics: ${errorDetail}`);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}
