import { API_BASE_URL } from '../config';
import { getStoredToken } from './authService';

export async function getProductReviews(productId) {
  const res = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}/reviews`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) return [];
  return await res.json();
}

export async function getProductRatingSummary(productId) {
  const res = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}/rating-summary`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) return { product_id: productId, review_count: 0, average_rating: 0 };
  return await res.json();
}

export async function submitProductReview(productId, rating, comment) {
  const token = getStoredToken();
  if (!token) throw new Error('You must be logged in to submit a review');

  const res = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}/reviews`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ rating: Number(rating), comment: comment }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to submit review');
  }

  return await res.json();
}
