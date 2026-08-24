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

export async function getWishlist() {
  const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch wishlist');
  return await res.json();
}

export async function addToWishlist(productId) {
  const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ product_id: productId }),
  });
  if (!res.ok) throw new Error('Failed to add product to wishlist');
  return await res.json();
}

export async function removeFromWishlist(productId) {
  const res = await fetch(`${API_BASE_URL}/api/wishlist/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to remove product from wishlist');
  return await res.json();
}
