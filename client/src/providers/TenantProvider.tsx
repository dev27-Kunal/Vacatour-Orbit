import React, { useState, useEffect, ReactNode } from 'react';
import { TenantContext } from '@/contexts/TenantContext';
import { useAuth } from '@/hooks/use-supabase-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Tenant,
  TenantMembership,
  CreateTenantRequest,
  UpdateTenantRequest,
  InviteMemberRequest,
  ApiResponse
} from '@/types/tenant';

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const { user, session } = useAuth();
  const { toast } = useToast();

  // State
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [currentMembership, setCurrentMembership] = useState<TenantMembership | null>(null);
  const [userTenants, setUserTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // API helpers
  const apiCall = async <T,>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const token = localStorage.getItem('auth_token') || session?.access_token;
    
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  };

  // Load user's tenants
  const refreshTenants = async () => {
    if (!user) {return;}

    try {
      setIsLoading(true);
      const response = await apiCall<Tenant[]>('/tenants');
      
      if (response.success && response.data) {
        setUserTenants(response.data);
        
        // If no current tenant is set but user has tenants, set the first one
        if (!currentTenant && response.data.length > 0) {
          await switchTenant(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load user tenants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your organizations',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load current tenant details
  const refreshCurrentTenant = async () => {
    if (!currentTenant) {return;}

    try {
      const response = await apiCall<{
        tenant: Tenant;
        membership: TenantMembership;
        usage: any;
      }>('/tenants/current');

      if (response.success && response.data) {
        setCurrentTenant(response.data.tenant);
        setCurrentMembership(response.data.membership);
      }
    } catch (error) {
      console.error('Failed to refresh current tenant:', error);
    }
  };

  // Switch to different tenant
  const switchTenant = async (tenantId: string): Promise<boolean> => {
    try {
      setIsSwitching(true);
      
      const response = await apiCall<{
        tenant: Tenant;
        membership: TenantMembership;
        token: string;
      }>('/tenants/switch', {
        method: 'POST',
        body: JSON.stringify({ tenant_id: tenantId })
      });

      if (response.success && response.data) {
        setCurrentTenant(response.data.tenant);
        setCurrentMembership(response.data.membership);
        
        // Update the auth token with tenant context
        localStorage.setItem('auth_token', response.data.token);
        
        toast({
          title: 'Success',
          description: `Switched to ${response.data.tenant.name}`
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to switch organization',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSwitching(false);
    }
  };

  // Create new tenant
  const createTenant = async (data: CreateTenantRequest): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await apiCall<{
        tenant: Tenant;
        token: string;
      }>('/tenants', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response.success && response.data) {
        // Update state with new tenant
        setCurrentTenant(response.data.tenant);
        setCurrentMembership({
          id: 'temp', // Will be loaded properly on refresh
          tenant_id: response.data.tenant.id,
          user_id: user!.id,
          role: 'OWNER',
          status: 'ACTIVE',
          joined_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        // Update auth token with tenant context
        localStorage.setItem('auth_token', response.data.token);
        
        // Refresh tenants list
        await refreshTenants();

        toast({
          title: 'Success',
          description: `Organization "${data.name}" created successfully`
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to create tenant:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create organization',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update current tenant
  const updateTenant = async (data: UpdateTenantRequest): Promise<boolean> => {
    if (!currentTenant) {return false;}

    try {
      setIsLoading(true);

      const response = await apiCall<Tenant>('/tenants/current', {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      if (response.success && response.data) {
        setCurrentTenant(response.data);
        
        toast({
          title: 'Success',
          description: 'Organization updated successfully'
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to update tenant:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update organization',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Invite member to tenant
  const inviteMember = async (data: InviteMemberRequest): Promise<boolean> => {
    if (!currentTenant) {return false;}

    try {
      const response = await apiCall('/tenants/invite', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: `Invitation sent to ${data.email}`
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to invite member:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Load tenants when user logs in
  useEffect(() => {
    if (user && !isLoading && userTenants.length === 0) {
      refreshTenants();
    }
  }, [user]);

  // Clear state when user logs out
  useEffect(() => {
    if (!user) {
      setCurrentTenant(null);
      setCurrentMembership(null);
      setUserTenants([]);
    }
  }, [user]);

  const value = {
    // State
    currentTenant,
    currentMembership,
    userTenants,
    isLoading,
    isSwitching,

    // Actions
    switchTenant,
    createTenant,
    updateTenant,
    inviteMember,

    // Data fetching
    refreshTenants,
    refreshCurrentTenant
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}