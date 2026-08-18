/**
 * PYHARA — Admin Location Management Service Layer
 */

import { API_BASE_URL } from '../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('pyhara_admin_token');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function fetchAdminLocations(search = '', activeOnly = false) {
  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (activeOnly) queryParams.append('active_only', 'true');

  const url = `${API_BASE_URL}/api/admin/locations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch delivery locations');
  return data;
}

export async function createAdminLocation(locationData) {
  const url = `${API_BASE_URL}/api/admin/locations`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(locationData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to create delivery location');
  return data;
}

export async function updateAdminLocation(locationId, updateData) {
  const url = `${API_BASE_URL}/api/admin/locations/${encodeURIComponent(locationId)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update delivery location');
  return data;
}

export async function deleteAdminLocation(locationId) {
  const url = `${API_BASE_URL}/api/admin/locations/${encodeURIComponent(locationId)}`;
  const res = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to delete delivery location');
  return data;
}
