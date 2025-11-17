import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Legacy function signature - keeping for backward compatibility
export async function apiRequestLegacy(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// New function signature compatible with fetch API
export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<any> {
  const token = localStorage.getItem("auth_token");
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const finalOptions = {
    method: options?.method || "GET",
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
    body: options?.body,
    credentials: "include" as const,
  };

  const res = await fetch(url, finalOptions);
  await throwIfResNotOk(res);
  
  // Return parsed JSON for successful requests
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
