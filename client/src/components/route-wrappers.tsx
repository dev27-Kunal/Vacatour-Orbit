/**
 * Route Wrappers
 *
 * Provides reusable route wrapper components with proper context boundaries.
 * These components handle authentication, authorization, and lazy loading
 * in a context-safe manner.
 */

import { Suspense, type ComponentType } from "react";
import { Redirect } from "wouter";
import { useApp } from "@/providers/AppProvider";

// =============================================================================
// LOADING COMPONENTS
// =============================================================================

/**
 * Full-screen loader for initial page loads
 */
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>
  );
}

/**
 * Small loader for component-level loading
 */
export function ComponentLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
}

// =============================================================================
// ROUTE WRAPPERS
// =============================================================================

/**
 * Protected Route
 * Requires authentication. Redirects to /login if not authenticated.
 *
 * Usage:
 *   <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
 */
export function ProtectedRoute({ component: Component }: { component: ComponentType }) {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

/**
 * Admin Route
 * Requires authentication AND admin privileges.
 * Shows access denied for non-admin users.
 *
 * Usage:
 *   <Route path="/admin" component={() => <AdminRoute component={AdminPanel} />} />
 */
export function AdminRoute({ component: Component }: { component: ComponentType }) {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Toegang Geweigerd</h1>
          <p className="text-gray-600">Je hebt geen beheerrechten om deze pagina te bekijken.</p>
        </div>
      </div>
    );
  }

  return <Component />;
}

/**
 * Public Route
 * Accessible without authentication.
 * Redirects to /dashboard if user is already logged in.
 *
 * Usage:
 *   <Route path="/login" component={() => <PublicRoute component={Login} />} />
 */
export function PublicRoute({ component: Component }: { component: ComponentType }) {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return <PageLoader />;
  }

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

/**
 * Lazy Route
 * Wraps a lazy-loaded component with Suspense boundary.
 * Use this for code-splitting non-critical pages.
 *
 * ⚠️ WARNING: Do NOT wrap authentication pages with LazyRoute!
 * Auth pages should be eagerly loaded to avoid context issues.
 *
 * Usage:
 *   const Dashboard = lazy(() => import("@/pages/dashboard"));
 *   <Route path="/dashboard" component={() => <LazyRoute component={Dashboard} />} />
 */
export function LazyRoute({ component: Component }: { component: ComponentType }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

/**
 * Protected Lazy Route
 * Combines ProtectedRoute + LazyRoute in proper order.
 * Ensures context is stable before lazy component loads.
 *
 * Usage:
 *   const Dashboard = lazy(() => import("@/pages/dashboard"));
 *   <Route path="/dashboard" component={() => <ProtectedLazyRoute component={Dashboard} />} />
 */
export function ProtectedLazyRoute({ component: Component }: { component: ComponentType }) {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // Context is stable here - safe to lazy load
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

/**
 * Admin Lazy Route
 * Combines AdminRoute + LazyRoute in proper order.
 *
 * Usage:
 *   const AdminPanel = lazy(() => import("@/pages/admin"));
 *   <Route path="/admin" component={() => <AdminLazyRoute component={AdminPanel} />} />
 */
export function AdminLazyRoute({ component: Component }: { component: ComponentType }) {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Toegang Geweigerd</h1>
          <p className="text-gray-600">Je hebt geen beheerrechten om deze pagina te bekijken.</p>
        </div>
      </div>
    );
  }

  // Context is stable here - safe to lazy load
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

/**
 * Public Lazy Route
 * For public pages that should be code-split.
 * Optionally redirects to dashboard if already logged in.
 *
 * Usage:
 *   const About = lazy(() => import("@/pages/about"));
 *   <Route path="/about" component={() => <PublicLazyRoute component={About} />} />
 *
 *   const Login = lazy(() => import("@/pages/login"));
 *   <Route path="/login" component={() => <PublicLazyRoute component={Login} requireGuest />} />
 */
export function PublicLazyRoute({
  component: Component,
  requireGuest = false,
}: {
  component: ComponentType;
  requireGuest?: boolean;
}) {
  // For pages that should redirect logged-in users
  if (requireGuest) {
    const { user, isLoading } = useApp();

    if (isLoading) {
      return <PageLoader />;
    }

    if (user) {
      return <Redirect to="/dashboard" />;
    }
  }

  // Safe to lazy load - no context dependency or context is checked first
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}
