/**
 * API Configuration
 *
 * @deprecated This file is deprecated. Use api-client.ts instead for all API calls.
 *
 * Migration path:
 * - Use apiGet(), apiPost(), apiPatch(), apiPut(), apiDelete() from '@/lib/api-client'
 * - All session cookies and authentication are handled automatically
 * - No need for manual base URL configuration
 *
 * @see client/src/lib/api-client.ts
 */

// Get API URL from environment or use defaults
/**
 * @deprecated Use api-client helpers instead
 */
export const getApiUrl = () => {
  console.warn('getApiUrl() is deprecated. Use api-client helpers instead.');

  // If explicitly set in environment, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Production: Use Railway backend
  if (import.meta.env.PROD) {
    // This will be set in Vercel environment variables
    return import.meta.env.VITE_API_URL || 'https://vacature-orbit-v2-production.up.railway.app';
  }

  // Development: Use local backend
  return 'http://localhost:3001';
};

/**
 * @deprecated Use api-client helpers instead
 */
export const API_URL = getApiUrl();

// Helper to build API endpoints
/**
 * @deprecated Use api-client helpers instead
 */
export const apiEndpoint = (path: string) => {
  console.warn('apiEndpoint() is deprecated. Use api-client helpers instead.');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};

// WebSocket URL (if needed in future)
/**
 * @deprecated Use api-client helpers instead
 */
export const getWsUrl = () => {
  console.warn('getWsUrl() is deprecated. Use api-client helpers instead.');
  const apiUrl = getApiUrl();
  return apiUrl.replace(/^http/, 'ws');
};

/**
 * @deprecated Use api-client helpers instead
 */
export const WS_URL = getWsUrl();