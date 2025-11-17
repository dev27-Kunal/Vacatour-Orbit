/**
 * Unified Application Provider
 *
 * Consolidates authentication, tenant context, and global state management
 * Uses V2 session-based authentication API
 *
 * @module client/providers/AppProvider
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import type { User as SharedUser } from '@shared/types';
import { apiGet, apiPost, apiPatch, ApiError, setAuthToken } from '@/lib/api-client';

// =============================================================================
// TYPES
// =============================================================================

// Extend the shared User type with frontend-specific properties
export interface User extends Omit<SharedUser, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
  currentTenantId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  type: 'COMPANY' | 'AGENCY' | 'PERSONAL';
  description?: string;
  logo?: string;
  website?: string;
  isVerified: boolean;
  subscriptionTier: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  createdAt: string;
  updatedAt: string;
}

export interface TenantMember {
  userId: string;
  tenantId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
}

interface AppContextType {
  // Auth state
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;

  // Tenant actions
  switchTenant: (tenantId: string) => Promise<boolean>;
  refreshTenant: () => Promise<void>;

  // Profile actions
  updateProfile: (updates: ProfileUpdates) => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  userType: 'BEDRIJF' | 'ZZP' | 'BUREAU' | 'SOLLICITANT';
}

interface ProfileUpdates {
  name?: string;
  companyName?: string;
  notificationEmail?: string;
}

// =============================================================================
// CONTEXT
// =============================================================================

const AppContext = createContext<AppContextType | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Note: Using centralized api-client helpers for all API calls
  // All requests automatically include credentials: 'include' for session management

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Check if user is authenticated using api-client
        try {
          const response = await apiGet('/api/auth/me');

          if (response.success && response.data) {
            // V2 backend returns { user, tenant, membership, session }
            // Some environments may still return just the user for backward compatibility
            const payload: any = response.data;
            const nextUser = payload.user || payload;
            const nextTenant = payload.tenant || null;

            setUser(nextUser);
            setTenant(nextTenant);
          } else {
            setUser(null);
            setTenant(null);
          }
        } catch (fetchErr) {
          if (fetchErr instanceof ApiError && fetchErr.status === 401) {
            console.warn('Not authenticated');
          } else {
            console.error('Auth check error:', fetchErr);
          }
          setUser(null);
          setTenant(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
        setTenant(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // =============================================================================
  // TENANT MANAGEMENT
  // =============================================================================

  const fetchCurrentTenant = async (): Promise<void> => {
    try {
      const response = await apiGet('/api/tenants/current');

      if (response.success && response.data) {
        setTenant(response.data);
      }
    } catch (err) {
      console.error('Error fetching current tenant:', err);
    }
  };

  const switchTenant = async (tenantId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await apiPost('/api/tenants/switch', { tenantId });

      if (response.success) {
        // Update user with new tenant
        setUser(prev => prev ? { ...prev, currentTenantId: tenantId } : null);

        // Fetch updated tenant data
        await fetchCurrentTenant();

        toast({
          title: t('tenant.switchSuccess'),
          description: t('tenant.switchedTo', { name: response.data?.name }),
        });

        return true;
      }

      return false;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to switch tenant';
      console.error('Switch tenant error:', err);
      toast({
        title: t('tenant.switchFailed'),
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTenant = async (): Promise<void> => {
    await fetchCurrentTenant();
  };

  // =============================================================================
  // AUTHENTICATION
  // =============================================================================

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiPost('/api/auth/login', { email, password });

      if (response.success && response.data) {
        const payload: any = response.data;
        // Set session token if present (V2 backend)
        if (payload.token) {
          setAuthToken(payload.token);
        }

        setUser(payload.user || payload);
        setTenant(payload.tenant || null);

        toast({
          title: t('auth.welcomeBack'),
          description: t('auth.loginSuccess'),
        });

        return { success: true };
      }

      const errorMessage = response.error || 'Login failed';
      setError(errorMessage);
      toast({
        title: t('auth.loginFailed'),
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'An unexpected error occurred';
      console.error('Login error:', err);

      setError(errorMessage);
      toast({
        title: t('auth.loginFailed'),
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiPost('/api/auth/register', userData);

      if (response.success) {
        toast({
          title: t('auth.registrationSuccess'),
          description: t('auth.checkEmailToConfirm'),
        });
        return true;
      }

      throw new Error(response.error || 'Registration failed');
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Registration failed';
      console.error('Registration error:', err);
      setError(errorMessage);
      toast({
        title: t('auth.registrationFailed'),
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      await apiPost('/api/auth/logout');

      // Clear state after logout
      setAuthToken(null);
      setUser(null);
      setTenant(null);

      toast({
        title: t('auth.signedOut'),
        description: t('auth.signOutSuccess'),
      });
    } catch (err) {
      console.error('Logout error:', err);

      // Still clear state on error
      setUser(null);
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await apiGet('/api/auth/me');

      if (response.success && response.data) {
        const payload: any = response.data;
        setUser(payload.user || payload);
        setTenant(payload.tenant || null);
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiPost('/api/auth/forgot-password', { email });

      if (response.success) {
        toast({
          title: t('auth.passwordResetRequested'),
          description: t('auth.checkEmailForReset'),
        });
        return true;
      }

      throw new Error(response.error || 'Password reset request failed');
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Password reset request failed';
      console.error('Forgot password error:', err);
      setError(errorMessage);
      toast({
        title: t('auth.passwordResetFailed'),
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdates): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await apiPatch('/api/auth/profile', updates);

      if (response.success && response.data) {
        setUser(response.data);

        toast({
          title: t('profile.updateSuccess'),
          description: t('profile.profileUpdated'),
        });

        return true;
      }

      return false;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Profile update failed';
      console.error('Update profile error:', err);
      toast({
        title: t('profile.updateFailed'),
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const value: AppContextType = {
    // State
    user,
    tenant,
    isAuthenticated: !!user,
    isLoading,
    error,

    // Auth actions
    login,
    register,
    logout,
    refreshUser,
    forgotPassword,

    // Tenant actions
    switchTenant,
    refreshTenant,

    // Profile actions
    updateProfile,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useApp() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
}

// Export alias for backward compatibility
export { useApp as useAuth };
