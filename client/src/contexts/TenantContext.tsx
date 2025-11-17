import { createContext, useContext } from 'react';
import {
  Tenant,
  TenantMembership,
  TenantContextType,
  CreateTenantRequest,
  UpdateTenantRequest,
  InviteMemberRequest
} from '@/types/tenant';

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export { TenantContext };