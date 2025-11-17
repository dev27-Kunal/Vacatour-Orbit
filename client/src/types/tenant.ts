export interface Tenant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  settings: Record<string, any>;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

export interface TenantMembership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE';
  joined_at: string;
  updated_at: string;
}

export interface TenantMember {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE';
  joined_at: string;
  updated_at: string;
}

export interface TenantInvitation {
  id: string;
  tenant_id: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  invited_by: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface TenantUsage {
  jobs_count: number;
  applications_count: number;
  members_count: number;
  plan_limits: {
    max_jobs?: number;
    max_applications?: number;
    max_members?: number;
  };
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  description?: string;
  settings?: Record<string, any>;
}

export interface UpdateTenantRequest {
  name?: string;
  description?: string;
  logo_url?: string;
  settings?: Record<string, any>;
}

export interface InviteMemberRequest {
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
  message?: string;
}

export interface TenantSwitchRequest {
  tenant_id: string;
}

export interface TenantContextType {
  // Current tenant state
  currentTenant: Tenant | null;
  currentMembership: TenantMembership | null;
  userTenants: Tenant[];
  
  // Loading states
  isLoading: boolean;
  isSwitching: boolean;
  
  // Actions
  switchTenant: (tenantId: string) => Promise<boolean>;
  createTenant: (data: CreateTenantRequest) => Promise<boolean>;
  updateTenant: (data: UpdateTenantRequest) => Promise<boolean>;
  inviteMember: (data: InviteMemberRequest) => Promise<boolean>;
  
  // Data fetching
  refreshTenants: () => Promise<void>;
  refreshCurrentTenant: () => Promise<void>;
}

export type TenantRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export const TENANT_ROLE_PERMISSIONS = {
  OWNER: ['manage_tenant', 'manage_members', 'manage_jobs', 'view_analytics', 'view_members'],
  ADMIN: ['manage_members', 'manage_jobs', 'view_analytics', 'view_members'],
  MANAGER: ['manage_jobs', 'view_analytics', 'view_members'],
  MEMBER: ['manage_own_jobs', 'view_members'],
  VIEWER: ['view_jobs', 'view_members']
} as const;

export type TenantPermission = 
  | 'manage_tenant'
  | 'manage_members'
  | 'manage_jobs'
  | 'manage_own_jobs'
  | 'view_analytics'
  | 'view_members'
  | 'view_jobs';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: {
    message: string;
    details?: any;
  };
}