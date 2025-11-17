/**
 * MSA (Master Service Agreement) Type Definitions
 *
 * Types for MSA approval workflow, matching backend schema
 */

export type MSAStatus = 'draft' | 'pending_approval' | 'active' | 'expired' | 'terminated';

export interface MSADocument {
  id: string;
  tenantId: string;
  companyId: string;
  bureauId: string;
  msaNumber: string;
  name: string;

  // Financial Terms
  paymentTermsDays: number;
  noticePeriodDays: number;
  liabilityCap?: number;

  // Document URLs
  msaDocumentUrl?: string;
  signedDocumentUrl?: string;

  // Status and Dates
  status: MSAStatus;
  effectiveDate: string;
  expirationDate: string;
  autoRenew: boolean;
  renewalPeriodMonths: number;

  // Company Approval
  companySignedAt?: string;
  companySignedBy?: string;
  companyApprovedAt?: string;
  companyApprovedBy?: string;

  // Bureau Approval
  bureauSignedAt?: string;
  bureauSignedBy?: string;
  bureauApprovedAt?: string;
  bureauApprovedBy?: string;

  // Metadata
  initiatedBy?: string;
  initiatedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Relations (populated by API)
  companyName?: string;
  bureauName?: string;
  initiatedByName?: string;
}

export interface MSAApprovalRequest {
  msaId: string;
  notes?: string;
}

export interface MSARejectionRequest {
  msaId: string;
  reason: string;
}

export interface MSAApprovalResponse {
  success: boolean;
  data: MSADocument;
  message?: string;
}

export interface MSAListResponse {
  success: boolean;
  data: MSADocument[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
