/**
 * PYHARA — Frontend Central API Configuration
 *
 * Single source of truth for the FastAPI backend API base URL.
 * Automatically resolves to production URL (https://pyhara.onrender.com)
 * or local development server (http://127.0.0.1:8000).
 */

const getApiBaseUrl = () => {
  // 1. Respect explicit Vite environment variable if configured
  if (import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  // 2. Production fallback on Render / deployed hostnames
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://pyhara.onrender.com';
  }

  // 3. Local development fallback
  return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getApiBaseUrl();
