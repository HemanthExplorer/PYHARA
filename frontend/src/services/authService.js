/**
 * PYHARA — Authentication Service Layer
 * 
 * Interacts with FastAPI Auth APIs:
 * POST /api/auth/login
 * POST /api/auth/register
 * GET  /api/auth/me
 * PUT  /api/auth/profile
 */

import { API_BASE_URL } from '../config';

const TOKEN_KEY = 'pyhara_auth_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('pyhara_admin_token') || null;
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
      localStorage.removeItem('pyhara_admin_token');
    }
  } catch (err) {
    console.error('Failed to update stored token:', err);
  }
}

export function removeStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('pyhara_admin_token');
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
    let errorDetail = 'Invalid username/email or password';
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

export async function register(fullName, email, phone, password) {
  const regUrl = `${API_BASE_URL}/api/auth/register`;

  const res = await fetch(regUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      full_name: fullName,
      email: email,
      phone: phone,
      password: password,
    }),
  });

  if (!res.ok) {
    let errorDetail = 'Registration failed';
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
    throw new Error(errorDetail);
  }

  return await res.json();
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

export async function updateProfile(data) {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorDetail = 'Failed to update profile';
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : errJson.detail[0]?.msg;
      }
    } catch {}
    throw new Error(errorDetail);
  }

  return await res.json();
}

export function logout() {
  removeStoredToken();
}
