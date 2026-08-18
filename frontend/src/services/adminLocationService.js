/**
 * PYHARA — Admin Location Management Service Layer
 */

const getHost = () => (typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1');

const getAuthHeaders = () => {
  const token = localStorage.getItem('pyhara_admin_token');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function fetchAdminLocations(search = '', activeOnly = false) {
  const host = getHost();
  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (activeOnly) queryParams.append('active_only', 'true');

  const url = `http://${host}:8000/api/admin/locations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch delivery locations');
  return data;
}

export async function createAdminLocation(locationData) {
  const host = getHost();
  const url = `http://${host}:8000/api/admin/locations`;
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
  const host = getHost();
  const url = `http://${host}:8000/api/admin/locations/${encodeURIComponent(locationId)}`;
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
  const host = getHost();
  const url = `http://${host}:8000/api/admin/locations/${encodeURIComponent(locationId)}`;
  const res = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to delete delivery location');
  return data;
}
