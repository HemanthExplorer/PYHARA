/**
 * PYHARA — Frontend Central API Configuration
 *
 * Single source of truth for the FastAPI backend API base URL.
 */

const getApiBaseUrl = () => {
  // Use the Vercel environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // Local development fallback
  return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getApiBaseUrl();