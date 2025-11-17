/**
 * Compliance API Client
 *
 * Client-side API helpers for compliance tracking endpoints
 */

import type {
  Certification,
  CertificationType,
  ComplianceScore,
  ComplianceScoreDetail,
  ExpiringCertification,
  ComplianceDashboardStats,
  CreateCertificationRequest,
  UpdateCertificationRequest,
  VerifyCertificationRequest,
  CreateCertificationTypeRequest,
  ApiResponse,
  PaginatedResponse,
  CertificationFilters,
  PaginationParams
} from '@/api/v2/vms/compliance/types';

const BASE_URL = '/api/v2/vms/compliance';

// ============================================================================
// Certifications
// ============================================================================

export async function getCertifications(
  filters?: CertificationFilters & PaginationParams
): Promise<PaginatedResponse<Certification>> {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }

  const response = await fetch(`${BASE_URL}/certifications?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch certifications');
  }

  return response.json();
}

export async function getCertification(id: string): Promise<ApiResponse<Certification>> {
  const response = await fetch(`${BASE_URL}/certifications/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch certification');
  }

  return response.json();
}

export async function createCertification(
  data: CreateCertificationRequest
): Promise<ApiResponse<Certification>> {
  const response = await fetch(`${BASE_URL}/certifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create certification');
  }

  return response.json();
}

export async function updateCertification(
  id: string,
  data: UpdateCertificationRequest
): Promise<ApiResponse<Certification>> {
  const response = await fetch(`${BASE_URL}/certifications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update certification');
  }

  return response.json();
}

export async function deleteCertification(id: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${BASE_URL}/certifications/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete certification');
  }

  return response.json();
}

export async function verifyCertification(
  id: string,
  data: VerifyCertificationRequest
): Promise<ApiResponse<Certification>> {
  const response = await fetch(`${BASE_URL}/certifications/${id}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to verify certification');
  }

  return response.json();
}

// ============================================================================
// Certification Types
// ============================================================================

export async function getCertificationTypes(
  activeOnly = true
): Promise<ApiResponse<CertificationType[]>> {
  const params = new URLSearchParams({ activeOnly: activeOnly.toString() });
  const response = await fetch(`${BASE_URL}/certification-types?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch certification types');
  }

  return response.json();
}

export async function createCertificationType(
  data: CreateCertificationTypeRequest
): Promise<ApiResponse<CertificationType>> {
  const response = await fetch(`${BASE_URL}/certification-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create certification type');
  }

  return response.json();
}

// ============================================================================
// Compliance Score
// ============================================================================

export async function getComplianceScore(
  bureauId: string,
  detailed = false
): Promise<ApiResponse<ComplianceScore | ComplianceScoreDetail>> {
  const params = new URLSearchParams({ detailed: detailed.toString() });
  const response = await fetch(`${BASE_URL}/compliance-score/${bureauId}?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch compliance score');
  }

  return response.json();
}

// ============================================================================
// Expiring Certifications
// ============================================================================

export async function getExpiringCertifications(
  bureauId?: string,
  urgencyLevel?: string,
  limit = 50
): Promise<ApiResponse<{
  certifications: ExpiringCertification[];
  summary: Record<string, number>;
  total: number;
}>> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (bureauId) {params.append('bureauId', bureauId);}
  if (urgencyLevel) {params.append('urgencyLevel', urgencyLevel);}

  const response = await fetch(`${BASE_URL}/expiring?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch expiring certifications');
  }

  return response.json();
}

// ============================================================================
// Documents
// ============================================================================

export async function uploadCertificationDocument(
  certificationId: string,
  file: File,
  documentType = 'CERTIFICATE'
): Promise<ApiResponse<any>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('certificationId', certificationId);
  formData.append('documentType', documentType);

  const response = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload document');
  }

  return response.json();
}

// ============================================================================
// Dashboard
// ============================================================================

export async function getComplianceDashboard(): Promise<ApiResponse<ComplianceDashboardStats>> {
  const response = await fetch(`${BASE_URL}/dashboard`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch dashboard stats');
  }

  return response.json();
}

// ============================================================================
// React Query Hooks (optional, for better caching)
// ============================================================================

export const complianceQueryKeys = {
  all: ['compliance'] as const,
  certifications: () => [...complianceQueryKeys.all, 'certifications'] as const,
  certification: (id: string) => [...complianceQueryKeys.certifications(), id] as const,
  certificationTypes: () => [...complianceQueryKeys.all, 'certification-types'] as const,
  complianceScore: (bureauId: string) => [...complianceQueryKeys.all, 'score', bureauId] as const,
  expiring: (filters?: any) => [...complianceQueryKeys.all, 'expiring', filters] as const,
  dashboard: () => [...complianceQueryKeys.all, 'dashboard'] as const
};
