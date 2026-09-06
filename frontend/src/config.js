/**
 * PYHARA — Frontend Central API Configuration
 *
 * Single source of truth for the FastAPI backend API base URL.
 */

const getApiBaseUrl = () => {
  // Use Vite environment variable if available
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // Production: use the deployed Vercel backend
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://pyhara-backend.vercel.app';
  }

  // Local development
  return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getApiBaseUrl();