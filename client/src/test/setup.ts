import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Only import React testing utilities if we're in a browser environment
if (typeof window !== 'undefined') {
  // This ensures React testing setup only runs for frontend tests
}

// Configure global test environment
beforeAll(() => {
  // Mock environment variables for testing
  process.env.VITE_SUPABASE_URL = 'https://test-supabase-url.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.VITE_API_URL = 'http://localhost:3000/api';
  
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  }));

  // Mock matchMedia (only in browser environment)
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  // Mock fetch globally
  global.fetch = vi.fn();

  // Mock localStorage (only in browser environment)
  if (typeof window !== 'undefined') {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    // Mock sessionStorage
    const sessionStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock
    });

    // Mock window.location
    delete (window as any).location;
    (window as any).location = {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    };
  }

  // Mock window.history (only in browser environment)
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'history', {
      value: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
        go: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        length: 1,
        state: null,
      },
      writable: true,
    });
  }

  // Mock console for cleaner test output
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Filter out React Testing Library warnings in tests
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Global test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  userType: 'ZZP' as const,
  isAdmin: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockJob = (overrides = {}) => ({
  id: 'test-job-123',
  title: 'Test Software Developer',
  description: 'Test job description',
  location: 'Amsterdam',
  employmentType: 'VAST' as const,
  salary: 5000,
  status: 'OPEN' as const,
  userId: 'test-user-123',
  companyName: 'Test Company',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockApplication = (overrides = {}) => ({
  id: 'test-application-123',
  jobId: 'test-job-123',
  userId: 'test-user-456',
  candidateName: 'Test Candidate',
  candidateEmail: 'candidate@example.com',
  candidatePhone: '+31612345678',
  motivation: 'I am very interested in this position.',
  hourlyRate: 75,
  availability: 'Per direct',
  status: 'NEW' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Mock API responses
export const mockApiResponse = <T>(data: T, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
  headers: new Headers(),
  redirected: false,
  statusText: status === 200 ? 'OK' : 'Error',
  type: 'basic' as ResponseType,
  url: '',
  clone: vi.fn(),
  body: null,
  bodyUsed: false,
});

// Mock fetch responses for different endpoints
export const setupMockApi = () => {
  const mockFetch = vi.fn();
  
  // Default responses
  mockFetch.mockImplementation((url: string, options: RequestInit = {}) => {
    const method = options.method || 'GET';
    
    if (url.includes('/api/auth/profile') && method === 'GET') {
      return Promise.resolve(mockApiResponse({
        user: createMockUser()
      }));
    }
    
    if (url.includes('/api/jobs') && method === 'GET') {
      return Promise.resolve(mockApiResponse({
        jobs: [createMockJob()],
        total: 1,
        page: 1,
        limit: 10
      }));
    }
    
    if (url.includes('/api/jobs') && method === 'POST') {
      return Promise.resolve(mockApiResponse(createMockJob(), 201));
    }
    
    if (url.includes('/api/auth/login') && method === 'POST') {
      return Promise.resolve(mockApiResponse({
        message: 'Login successful',
        user: createMockUser(),
        token: 'test-token-123'
      }));
    }
    
    if (url.includes('/api/auth/register') && method === 'POST') {
      return Promise.resolve(mockApiResponse({
        message: 'Registration successful',
        user: createMockUser()
      }, 201));
    }
    
    // Default error response
    return Promise.resolve(mockApiResponse({
      error: 'Not found'
    }, 404));
  });
  
  global.fetch = mockFetch;
  return mockFetch;
};

// Test data generators
export const generateTestUsers = (count: number) => 
  Array.from({ length: count }, (_, i) => createMockUser({
    id: `test-user-${i}`,
    email: `user${i}@example.com`,
    name: `Test User ${i}`
  }));

export const generateTestJobs = (count: number) => 
  Array.from({ length: count }, (_, i) => createMockJob({
    id: `test-job-${i}`,
    title: `Test Job ${i}`,
    location: ['Amsterdam', 'Utrecht', 'Rotterdam'][i % 3]
  }));

export const generateTestApplications = (count: number) => 
  Array.from({ length: count }, (_, i) => createMockApplication({
    id: `test-application-${i}`,
    candidateName: `Candidate ${i}`,
    candidateEmail: `candidate${i}@example.com`
  }));

// Mock authentication context
export const createMockAuthContext = (user = null, overrides = {}) => ({
  user,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
  error: null,
  ...overrides,
});

// Mock language context
export const createMockLanguageContext = (language = 'nl', overrides = {}) => ({
  language,
  setLanguage: vi.fn(),
  t: (key: string, params?: Record<string, any>) => {
    // Simple translation mock - returns the key with params interpolated
    if (params) {
      return key.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => 
        params[paramKey] || match
      );
    }
    return key;
  },
  ...overrides,
});

// Test helper for waiting for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock file upload
export const createMockFile = (name = 'test.pdf', type = 'application/pdf') => {
  const file = new File(['test content'], name, { type });
  return file;
};

// Mock form data
export const createMockFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

// Error simulation helpers
export const simulateNetworkError = () => {
  const error = new Error('Network error');
  error.name = 'NetworkError';
  return error;
};

export const simulateValidationError = (field: string, message: string) => ({
  error: 'Validation failed',
  details: {
    [field]: [message]
  }
});

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  await waitForAsync();
  const end = performance.now();
  return end - start;
};

// Mock intersection observer for lazy loading tests
export const mockIntersectionObserver = (isIntersecting = true) => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockImplementation((callback) => ({
    observe: vi.fn().mockImplementation((element) => {
      callback([{ target: element, isIntersecting }]);
    }),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  
  window.IntersectionObserver = mockIntersectionObserver as any;
  return mockIntersectionObserver;
};

// Mock media query for responsive tests
export const mockMediaQuery = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Accessibility testing helpers
export const checkAriaAttributes = (element: HTMLElement) => {
  const ariaAttributes = Array.from(element.attributes)
    .filter(attr => attr.name.startsWith('aria-'))
    .reduce((acc, attr) => {
      acc[attr.name] = attr.value;
      return acc;
    }, {} as Record<string, string>);
  
  return ariaAttributes;
};

export const checkKeyboardNavigation = (element: HTMLElement) => {
  const tabIndex = element.getAttribute('tabindex');
  const role = element.getAttribute('role');
  const isInteractive = element.tagName === 'BUTTON' || 
                       element.tagName === 'INPUT' || 
                       element.tagName === 'A' ||
                       tabIndex === '0';
  
  return {
    tabIndex,
    role,
    isInteractive,
    canReceiveFocus: isInteractive || (tabIndex && tabIndex !== '-1')
  };
};