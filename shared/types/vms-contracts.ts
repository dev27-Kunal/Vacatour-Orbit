/**
 * VMS Contract Management API Types
 * Type definitions for contract lifecycle management
 */

// ============================================
// ENUMS
// ============================================

export type ContractStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PENDING_SIGNATURE'
  | 'PARTIALLY_SIGNED'
  | 'FULLY_SIGNED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'TERMINATED';

export type SignatureType =
  | 'ELECTRONIC'
  | 'DIGITAL'
  | 'WET'
  | 'CLICK_TO_SIGN';

export type EmploymentType =
  | 'VAST'
  | 'INTERIM'
  | 'UITZENDEN';

export type FeeType =
  | 'PERCENTAGE'
  | 'FIXED_AMOUNT'
  | 'HOURLY_MARKUP';

export type AmendmentType =
  | 'RENEWAL'
  | 'SALARY_CHANGE'
  | 'HOURS_CHANGE'
  | 'TERMINATION'
  | 'OTHER';

export type SignerRole =
  | 'COMPANY'
  | 'BUREAU'
  | 'CANDIDATE'
  | 'OTHER';

export type ExportFormat =
  | 'PDF'
  | 'CSV'
  | 'XLSX';

// ============================================
// REQUEST TYPES
// ============================================

export interface CreateContractRequest {
  applicationId: string;
  jobId: string;
  templateId?: string;
  msaId?: string;
  rateCardId?: string;
  bureauId: string;
  candidateId: string;
  contractType: EmploymentType;
  jobTitle: string;
  department?: string;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate?: string; // ISO date string YYYY-MM-DD
  monthlySalary?: number;
  hourlyRate?: number;
  hoursPerWeek?: number;
  workLocation?: string;
  remotePercentage?: number;
  probationPeriodMonths?: number;
  noticePeriodDays?: number;
  vacationDays?: number;
  specialClauses?: string;
  benefits?: Record<string, any>;
}

export interface UpdateContractRequest {
  status?: ContractStatus;
  monthlySalary?: number;
  hourlyRate?: number;
  endDate?: string;
  workLocation?: string;
  remotePercentage?: number;
  specialClauses?: string;
  benefits?: Record<string, any>;
}

export interface SignContractRequest {
  signatureType: SignatureType;
  signatureData?: string; // Base64 encoded signature image or certificate
}

export interface RenewContractRequest {
  newEndDate: string; // ISO date string
  salaryIncrease?: number; // Percentage
  adjustments?: Record<string, any>;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  contractType: EmploymentType;
  templateContent: string; // HTML/Markdown with {{variables}}
  variables?: Record<string, any>;
  requiresApproval?: boolean;
  approvalRoles?: string[];
  isDefault?: boolean;
}

export interface CreateRateCardRequest {
  bureauId: string;
  companyId?: string;
  msaId?: string;
  name: string;
  description?: string;
  validFrom: string; // ISO date string
  validUntil: string; // ISO date string
  isDefault?: boolean;
  lines: RateCardLineInput[];
}

export interface RateCardLineInput {
  jobCategory: string;
  seniorityLevel: string;
  feeType: FeeType;
  placementFeePercentage?: number;
  hourlyMarkupPercentage?: number;
  fixedFeeAmount?: number;
  hourlyMarkupAmount?: number;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  minMonthlySalary?: number;
  maxMonthlySalary?: number;
}

export interface ContractFilters {
  status?: string;
  contractType?: string;
  companyId?: string;
  bureauId?: string;
  candidateId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  page?: number;
  limit?: number;
}

export interface ExportContractsRequest {
  contractIds: string[];
  format?: ExportFormat;
  includeSignatures?: boolean;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface Contract {
  id: string;
  tenant_id: string;
  application_id: string;
  job_id: string;
  template_id?: string;
  msa_id?: string;
  rate_card_id?: string;
  contract_number: string;
  company_id: string;
  bureau_id?: string;
  candidate_id: string;
  contract_type: EmploymentType;
  job_title: string;
  department?: string;
  start_date: string;
  end_date?: string;
  currency: string;
  monthly_salary?: number;
  vacation_allowance?: number;
  hourly_rate?: number;
  hours_per_week?: number;
  overtime_rate?: number;
  bureau_fee_amount?: number;
  bureau_fee_percentage?: number;
  fee_calculation_details?: Record<string, any>;
  work_location?: string;
  remote_percentage: number;
  probation_period_months: number;
  notice_period_days: number;
  vacation_days: number;
  special_clauses?: string;
  benefits?: Record<string, any>;
  status: ContractStatus;
  generated_pdf_url?: string;
  signed_pdf_url?: string;
  contract_html?: string;
  contract_variables?: Record<string, any>;
  signatures_required: number;
  signatures_received: number;
  approved_at?: string;
  approved_by?: string;
  activated_at?: string;
  activated_by?: string;
  terminated_at?: string;
  terminated_by?: string;
  termination_reason?: string;
  termination_date?: string;
  fully_signed_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ContractTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  contract_type: EmploymentType;
  template_content: string;
  variables: Record<string, any>;
  requires_approval: boolean;
  approval_roles: string[];
  is_default: boolean;
  is_active: boolean;
  version: number;
  parent_template_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RateCard {
  id: string;
  tenant_id: string;
  msa_id?: string;
  bureau_id: string;
  company_id?: string;
  name: string;
  description?: string;
  is_default: boolean;
  is_active: boolean;
  bureau_locked: boolean;
  valid_from: string;
  valid_until: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  rate_card_lines?: RateCardLine[];
}

export interface RateCardLine {
  id: string;
  rate_card_id: string;
  job_category: string;
  seniority_level: string;
  fee_type: FeeType;
  placement_fee_percentage?: number;
  hourly_markup_percentage?: number;
  fixed_fee_amount?: number;
  hourly_markup_amount?: number;
  min_hourly_rate?: number;
  max_hourly_rate?: number;
  min_monthly_salary?: number;
  max_monthly_salary?: number;
  volume_discount_threshold?: number;
  volume_discount_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface ContractSignature {
  id: string;
  contract_id: string;
  signer_id: string;
  signer_name: string;
  signer_role: SignerRole;
  signature_type: SignatureType;
  signature_data: Record<string, any>;
  signed_at: string;
  is_valid: boolean;
  invalidated_at?: string;
  invalidated_reason?: string;
  created_at: string;
}

export interface ContractAmendment {
  id: string;
  contract_id: string;
  tenant_id: string;
  amendment_number: string;
  amendment_type: AmendmentType;
  description: string;
  changes_json: Record<string, any>;
  status: string;
  effective_date: string;
  amendment_pdf_url?: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractStats {
  total: number;
  byStatus: Record<ContractStatus, number>;
  byType: Record<EmploymentType, number>;
  active: number;
  pendingSignature: number;
  expiringSoon: number;
  totalValue: number;
}

export interface ExportResult {
  format: ExportFormat;
  contractIds: string[];
  includeSignatures?: boolean;
  generatedAt: string;
  downloadUrl: string;
  expiresAt: string;
}

// ============================================
// API RESPONSE WRAPPERS
// ============================================

export interface ContractListResponse {
  success: boolean;
  contracts: Contract[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ContractResponse {
  success: boolean;
  contract: Contract;
}

export interface TemplateListResponse {
  success: boolean;
  templates: ContractTemplate[];
}

export interface TemplateResponse {
  success: boolean;
  template: ContractTemplate;
}

export interface RateCardListResponse {
  success: boolean;
  rateCards: RateCard[];
}

export interface RateCardResponse {
  success: boolean;
  rateCard: RateCard;
}

export interface SignatureResponse {
  success: boolean;
  signature: ContractSignature;
}

export interface RenewalResponse {
  success: boolean;
  contract: Contract;
  amendment: ContractAmendment;
}

export interface StatsResponse {
  success: boolean;
  stats: ContractStats;
}

export interface ExpiringContractsResponse {
  success: boolean;
  contracts: Contract[];
  daysAhead: number;
}

export interface ExportResponse {
  success: boolean;
  data: ExportResult;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface ContractWithRelations extends Contract {
  application?: {
    id: string;
    candidate_id: string;
    job_id: string;
  };
  job?: {
    id: string;
    title: string;
    company: string;
  };
  signatures?: ContractSignature[];
  approvals?: any[];
  amendments?: ContractAmendment[];
}

export interface BureauFeeCalculation {
  feeAmount: number;
  details: {
    rate_card_id: string;
    line_id: string;
    fee_type: FeeType;
    percentage?: number;
    base_amount?: number;
    fixed_amount?: number;
    markup_amount?: number;
    hourly_rate?: number;
  };
}

// ============================================
// VALIDATION HELPERS
// ============================================

export const isValidContractStatus = (status: string): status is ContractStatus => {
  return [
    'DRAFT',
    'PENDING_REVIEW',
    'PENDING_APPROVAL',
    'APPROVED',
    'PENDING_SIGNATURE',
    'PARTIALLY_SIGNED',
    'FULLY_SIGNED',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
    'TERMINATED'
  ].includes(status);
};

export const isValidSignatureType = (type: string): type is SignatureType => {
  return ['ELECTRONIC', 'DIGITAL', 'WET', 'CLICK_TO_SIGN'].includes(type);
};

export const isValidEmploymentType = (type: string): type is EmploymentType => {
  return ['VAST', 'INTERIM', 'UITZENDEN'].includes(type);
};

export const isValidFeeType = (type: string): type is FeeType => {
  return ['PERCENTAGE', 'FIXED_AMOUNT', 'HOURLY_MARKUP'].includes(type);
};
