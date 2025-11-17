/**
 * API Client for V2 Session-Based Authentication
 *
 * Replaces Bearer token authentication with session cookies
 * All requests use credentials: 'include' for session management
 *
 * @module client/lib/api-client
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Array<{ code: string; message: string; field?: string }>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ApiError extends Error {
  code?: string;
  field?: string;
  status?: number;

  constructor(message: string, options?: { code?: string; field?: string; status?: number }) {
    super(message);
    this.name = 'ApiError';
    this.code = options?.code;
    this.field = options?.field;
    this.status = options?.status;
  }
}

// =============================================================================
// CONFIGURATION
// =============================================================================

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Central auth token storage key
export const AUTH_TOKEN_STORAGE_KEY = 'APP_SESSION_TOKEN';

export function getAuthToken(): string | null {
  try {
    if (typeof window === 'undefined') {return null;}
    // Primary key
    const primary = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (primary) {return primary;}
    // Backward compatibility with legacy key
    return window.localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (typeof window === 'undefined') {return;}
    if (!token) {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      // Remove legacy key
      window.localStorage.removeItem('auth_token');
    } else {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      // Maintain legacy key for older helpers
      window.localStorage.setItem('auth_token', token);
    }
  } catch {
    // ignore
  }
}

/**
 * Build full API URL with base URL
 */
function buildApiUrl(path: string): string {
  // If path already includes the domain, return as-is
  if (path.startsWith('http')) {
    return path;
  }

  // SOLID FIX: Send login DIRECT to Railway for tenant context
  // Only keep endpoints that MUST go through Vercel
  //
  // Why login goes to Railway:
  // - Railway V2 auth returns { user, tenant, membership, token }
  // - Vercel proxy adds unnecessary latency + cost
  // - Direct connection is faster, simpler, more maintainable
  //
  // Endpoints still via Vercel (for now):
  // - /api/auth/register - Legacy Supabase registration
  // - /api/auth/forgot-password - May use Vercel email service
  const sameOriginPaths = ['/api/auth/register', '/api/auth/forgot-password'];
  if (sameOriginPaths.some(prefix => path.startsWith(prefix))) {
    return path;
  }

  // If we have a base URL, use it for other endpoints
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  }

  // Otherwise use relative URL (works for same-domain deployment)
  return path;
}

/**
 * Get default headers for session-based requests
 */
// NOTE: Do not force Content-Type for GET/HEAD to avoid unnecessary CORS preflights
function mergeHeaders(method: string | undefined, custom?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {};

  const upper = (method || 'GET').toUpperCase();
  if (upper !== 'GET' && upper !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }

  // Attach Authorization header if we have a session token
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return {
    ...headers,
    ...(custom as Record<string, string>),
  };
}

// =============================================================================
// BACKWARD COMPATIBILITY (Deprecated - use apiClient instead)
// =============================================================================

/**
 * @deprecated Use session-based apiClient instead
 */
export function getAuthHeaders(): Record<string, string> {
  console.warn('getAuthHeaders() is deprecated. Use session-based apiClient instead.');
  return getDefaultHeaders();
}

/**
 * @deprecated Use session-based apiClient instead
 */
export function getJsonAuthHeaders(): Record<string, string> {
  console.warn('getJsonAuthHeaders() is deprecated. Use session-based apiClient instead.');
  return getDefaultHeaders();
}

// =============================================================================
// V2 API CLIENT (Session-Based)
// =============================================================================

/**
 * Check if endpoint is public (should not redirect on 401)
 */
function isPublicEndpoint(endpoint: string): boolean {
  const publicEndpoints = [
    '/api/auth/me',           // Optional auth check
    '/api/v2/jobs',           // Public job listing
    '/api/v2/jobs/',          // Public job detail
    '/api/vms/bureau-rankings', // Public bureau rankings
  ];

  return publicEndpoints.some(pattern => endpoint.startsWith(pattern));
}

/**
 * Make authenticated request with session cookies
 */
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = buildApiUrl(endpoint);

  try {
    const response = await fetch(url, {
      ...options,
      headers: mergeHeaders(options.method, options.headers),
      credentials: 'include', // CRITICAL: Send session cookies
    });

    // Parse response
    const data: ApiResponse<T> = await response.json();

    // Handle HTTP errors
    if (!response.ok) {
      const errorMessage = data.error || (data as any)?.message || data.errors?.[0]?.message || 'Request failed';

      // Handle 401 - show precise message for auth flows; redirect only for protected pages
      if (response.status === 401) {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const isPublic = isPublicEndpoint(endpoint);
        const isAuthFlow = endpoint.includes('/api/auth/login')
          || endpoint.includes('/api/auth/register')
          || endpoint.includes('/api/auth/forgot-password');

        // On login/register/forgot, do NOT mask the error as session expired
        if (isAuthFlow) {
          throw new ApiError(errorMessage || 'Unauthorized', {
            code: data.error,
            status: 401,
          });
        }

        // Don't redirect if:
        // - Already on login/register pages
        // - Requesting a public endpoint (expected 401 for optional auth)
        // - On a public page like /jobs or /jobs/:id
        const publicPages = ['/login', '/register', '/jobs', '/', '/reset-password', '/confirm-email'];
        const isOnPublicPage = publicPages.some(page => currentPath.startsWith(page));

        if (!isPublic && !isOnPublicPage) {
          // Clear stored token on 401 for protected resources
          setAuthToken(null);
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        throw new ApiError(errorMessage || 'Session expired. Please log in again.', { status: 401 });
      }

      throw new ApiError(errorMessage, {
        code: data.errors?.[0]?.code || data.error,
        field: data.errors?.[0]?.field,
        status: response.status,
      });
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    // Network or parsing error
    throw new ApiError(
      err instanceof Error ? err.message : 'Unknown error occurred',
      { status: 0 }
    );
  }
}

/**
 * Session-based GET request
 */
export async function apiGet<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  const queryString = params
    ? '?' + new URLSearchParams(params as any).toString()
    : '';

  return request<T>(endpoint + queryString, {
    method: 'GET',
  });
}

/**
 * Session-based POST request
 */
export async function apiPost<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Session-based PATCH request
 */
export async function apiPatch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Session-based PUT request
 */
export async function apiPut<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Session-based DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'DELETE',
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extract error message from API response or error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred';
}

/**
 * Check if error is authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 401 || error.code === 'UNAUTHORIZED';
  }

  return false;
}

/**
 * Check if error is validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 400 || error.code === 'VALIDATION_ERROR';
  }

  return false;
}

/**
 * Check if error is not found error
 */
export function isNotFoundError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 404 || error.code === 'NOT_FOUND';
  }

  return false;
}
