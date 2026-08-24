import { API_BASE_URL } from '../config';
import { getStoredToken } from './authService';

function getAuthHeaders() {
  const token = getStoredToken();
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function getUserAddresses() {
  const res = await fetch(`${API_BASE_URL}/api/addresses`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch saved addresses');
  return await res.json();
}

export async function createAddress(addressData) {
  const res = await fetch(`${API_BASE_URL}/api/addresses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(addressData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to add address');
  }
  return await res.json();
}

export async function updateAddress(id, addressData) {
  const res = await fetch(`${API_BASE_URL}/api/addresses/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(addressData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to update address');
  }
  return await res.json();
}

export async function deleteAddress(id) {
  const res = await fetch(`${API_BASE_URL}/api/addresses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete address');
  return await res.json();
}

export async function setDefaultAddress(id) {
  const res = await fetch(`${API_BASE_URL}/api/addresses/${encodeURIComponent(id)}/default`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to set default address');
  return await res.json();
}
