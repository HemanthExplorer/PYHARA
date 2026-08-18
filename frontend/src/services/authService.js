/**
 * PYHARA — Admin Authentication Service Layer
 * 
 * Interacts with FastAPI Auth APIs:
 * POST /api/auth/login
 * GET  /api/auth/me
 */

import { API_BASE_URL } from '../config';

const TOKEN_KEY = 'pyhara_admin_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch (err) {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error('Failed to update stored token:', err);
  }
}

export function removeStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {}
}

export async function login(username, password) {
  const loginUrl = `${API_BASE_URL}/api/auth/login`;

  const res = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    let errorDetail = 'Invalid username or password';
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        if (typeof errJson.detail === 'string') {
          errorDetail = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail.map((e) => e.msg).join(', ');
        }
      }
    } catch {}
    const err = new Error(errorDetail);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  if (data && data.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function getCurrentUser(overrideToken = null) {
  const token = overrideToken || getStoredToken();
  if (!token) return null;

  const meUrl = `${API_BASE_URL}/api/auth/me`;

  const res = await fetch(meUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    removeStoredToken();
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to validate token: HTTP ${res.status}`);
  }

  return await res.json();
}

export function logout() {
  removeStoredToken();
}
