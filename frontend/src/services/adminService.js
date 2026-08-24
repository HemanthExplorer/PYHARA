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

export async function getDashboardStats() {
  const url = `${API_BASE_URL}/api/admin/dashboard`;

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

export async function getAdminCustomers() {
  const res = await fetch(`${API_BASE_URL}/api/admin/customers`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch customers list');
  return await res.json();
}

export async function getAdminReviews() {
  const res = await fetch(`${API_BASE_URL}/api/admin/reviews`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch reviews list');
  return await res.json();
}

export async function deleteAdminReview(reviewId) {
  const res = await fetch(`${API_BASE_URL}/api/admin/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete review');
  return await res.json();
}
