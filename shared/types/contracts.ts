/**
 * Contract Management System Types
 *
 * Type definitions for VMS Phase 3A contract management
 * Includes contracts, MSAs, rate cards, signatures, and approvals
 */

import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const ContractStatusEnum = z.enum([
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
]);
export type ContractStatus = z.infer<typeof ContractStatusEnum>;

export const SignatureTypeEnum = z.enum([
  'ELECTRONIC',
  'DIGITAL',
  'WET',
  'CLICK_TO_SIGN'
]);
export type SignatureType = z.infer<typeof SignatureTypeEnum>;

export const FeeTypeEnum = z.enum([
  'PERCENTAGE',
  'FIXED',
  'TIERED',
  'CUSTOM'
]);
export type FeeType = z.infer<typeof FeeTypeEnum>;

export const MSAStatusEnum = z.enum([
  'DRAFT',
  'ACTIVE',
  'EXPIRED',
  'TERMINATED'
]);
export type MSAStatus = z.infer<typeof MSAStatusEnum>;

export const SignerTypeEnum = z.enum([
  'COMPANY',
  'BUREAU',
  'CANDIDATE'
]);
export type SignerType = z.infer<typeof SignerTypeEnum>;

export const ApprovalStatusEnum = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SKIPPED'
]);
export type ApprovalStatus = z.infer<typeof ApprovalStatusEnum>;

export const ApproverRoleEnum = z.enum([
  'HIRING_MANAGER',
  'HR',
  'LEGAL',
  'FINANCE',
  'BUREAU_MANAGER',
  'DIRECTOR'
]);
export type ApproverRole = z.infer<typeof ApproverRoleEnum>;

// ============================================================================
// CONTRACT TEMPLATE
// ============================================================================

export const ContractTemplateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  contractType: z.enum(['VAST', 'INTERIM', 'UITZENDEN']),
  templateContent: z.string(),
  variables: z.record(z.any()).default({}),
  requiresApproval: z.boolean().default(false),
  approvalRoles: z.array(z.string()).default([]),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  version: z.number().int().default(1),
  parentTemplateId: z.string().uuid().optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ContractTemplate = z.infer<typeof ContractTemplateSchema>;

export const CreateContractTemplateSchema = ContractTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateContractTemplate = z.infer<typeof CreateContractTemplateSchema>;

export const UpdateContractTemplateSchema = ContractTemplateSchema.partial().omit({
  id: true,
  tenantId: true,
  createdBy: true,
  createdAt: true,
});

export type UpdateContractTemplate = z.infer<typeof UpdateContractTemplateSchema>;

// ============================================================================
// MASTER SERVICE AGREEMENT (MSA)
// ============================================================================

export const MasterServiceAgreementSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  companyId: z.string().uuid(),
  bureauId: z.string().uuid(),
  msaNumber: z.string(),
  name: z.string().min(1).max(255),
  paymentTermsDays: z.number().int().default(30),
  noticePeriodDays: z.number().int().default(30),
  liabilityCap: z.number().optional(),
  msaDocumentUrl: z.string().url().optional(),
  signedDocumentUrl: z.string().url().optional(),
  status: MSAStatusEnum.default('DRAFT'),
  effectiveDate: z.date(),
  expirationDate: z.date(),
  autoRenew: z.boolean().default(false),
  renewalPeriodMonths: z.number().int().default(12),
  companySignedAt: z.date().optional(),
  companySignedBy: z.string().uuid().optional(),
  bureauSignedAt: z.date().optional(),
  bureauSignedBy: z.string().uuid().optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MasterServiceAgreement = z.infer<typeof MasterServiceAgreementSchema>;

export const CreateMSASchema = MasterServiceAgreementSchema.omit({
  id: true,
  msaNumber: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateMSA = z.infer<typeof CreateMSASchema>;

// ============================================================================
// RATE CARD
// ============================================================================

export const RateCardSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  msaId: z.string().uuid().optional(),
  bureauId: z.string().uuid(),
  companyId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  bureauLocked: z.boolean().default(false),
  validFrom: z.date(),
  validUntil: z.date(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RateCard = z.infer<typeof RateCardSchema>;

export const RateCardLineSchema = z.object({
  id: z.string().uuid(),
  rateCardId: z.string().uuid(),
  jobCategory: z.string().min(1).max(100),
  seniorityLevel: z.string().min(1).max(50),
  feeType: FeeTypeEnum,
  placementFeePercentage: z.number().min(0).max(100).optional(),
  hourlyMarkupPercentage: z.number().min(0).max(100).optional(),
  fixedFeeAmount: z.number().min(0).optional(),
  tierRanges: z.array(z.object({
    min: z.number(),
    max: z.number(),
    percentage: z.number(),
  })).optional(),
  minHourlyRate: z.number().min(0).optional(),
  maxHourlyRate: z.number().min(0).optional(),
  minMonthlySalary: z.number().min(0).optional(),
  maxMonthlySalary: z.number().min(0).optional(),
  volumeDiscountThreshold: z.number().int().optional(),
  volumeDiscountPercentage: z.number().min(0).max(100).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RateCardLine = z.infer<typeof RateCardLineSchema>;

export const CreateRateCardSchema = z.object({
  tenantId: z.string().uuid(),
  msaId: z.string().uuid().optional(),
  bureauId: z.string().uuid(),
  companyId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  validFrom: z.date(),
  validUntil: z.date(),
  createdBy: z.string().uuid(),
  lines: z.array(RateCardLineSchema.omit({
    id: true,
    rateCardId: true,
    createdAt: true,
    updatedAt: true,
  })),
});

export type CreateRateCard = z.infer<typeof CreateRateCardSchema>;

// ============================================================================
// CONTRACT
// ============================================================================

export const ContractSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  applicationId: z.string().uuid(),
  jobId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  msaId: z.string().uuid().optional(),
  rateCardId: z.string().uuid().optional(),
  contractNumber: z.string(),
  companyId: z.string().uuid(),
  bureauId: z.string().uuid().optional(),
  candidateId: z.string().uuid(),
  contractType: z.enum(['VAST', 'INTERIM', 'UITZENDEN']),
  jobTitle: z.string().min(1).max(255),
  department: z.string().max(255).optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  currency: z.string().length(3).default('EUR'),
  monthlySalary: z.number().min(0).optional(),
  vacationAllowance: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  hoursPerWeek: z.number().min(0).optional(),
  overtimeRate: z.number().min(0).optional(),
  bureauFeeAmount: z.number().min(0).optional(),
  bureauFeePercentage: z.number().min(0).max(100).optional(),
  feeCalculationDetails: z.record(z.any()).optional(),
  workLocation: z.string().optional(),
  remotePercentage: z.number().int().min(0).max(100).default(0),
  probationPeriodMonths: z.number().int().default(1),
  noticePeriodDays: z.number().int().default(30),
  vacationDays: z.number().int().default(25),
  specialClauses: z.string().optional(),
  benefits: z.record(z.any()).optional(),
  status: ContractStatusEnum.default('DRAFT'),
  generatedPdfUrl: z.string().url().optional(),
  signedPdfUrl: z.string().url().optional(),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.date().optional(),
  approvalNotes: z.string().optional(),
  signaturesRequired: z.number().int().default(3),
  signaturesReceived: z.number().int().default(0),
  fullySignedAt: z.date().optional(),
  activatedAt: z.date().optional(),
  activatedBy: z.string().uuid().optional(),
  terminatedAt: z.date().optional(),
  terminatedBy: z.string().uuid().optional(),
  terminationReason: z.string().optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Contract = z.infer<typeof ContractSchema>;

export const CreateContractSchema = z.object({
  tenantId: z.string().uuid(),
  applicationId: z.string().uuid(),
  jobId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  companyId: z.string().uuid(),
  bureauId: z.string().uuid().optional(),
  candidateId: z.string().uuid(),
  contractType: z.enum(['VAST', 'INTERIM', 'UITZENDEN']),
  jobTitle: z.string().min(1).max(255),
  department: z.string().max(255).optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  monthlySalary: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  hoursPerWeek: z.number().min(0).optional(),
  workLocation: z.string().optional(),
  remotePercentage: z.number().int().min(0).max(100).default(0),
  specialClauses: z.string().optional(),
  benefits: z.record(z.any()).optional(),
  createdBy: z.string().uuid(),
});

export type CreateContract = z.infer<typeof CreateContractSchema>;

export const UpdateContractSchema = ContractSchema.partial().omit({
  id: true,
  tenantId: true,
  applicationId: true,
  contractNumber: true,
  createdBy: true,
  createdAt: true,
});

export type UpdateContract = z.infer<typeof UpdateContractSchema>;

// ============================================================================
// CONTRACT SIGNATURE
// ============================================================================

export const ContractSignatureSchema = z.object({
  id: z.string().uuid(),
  contractId: z.string().uuid(),
  signerType: SignerTypeEnum,
  signerId: z.string().uuid(),
  signerName: z.string().min(1).max(255),
  signerEmail: z.string().email(),
  signatureType: SignatureTypeEnum,
  signatureData: z.string().optional(),
  docusignEnvelopeId: z.string().optional(),
  docusignRecipientId: z.string().optional(),
  signedAt: z.date().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  reminderSentAt: z.date().optional(),
  reminderCount: z.number().int().default(0),
  createdAt: z.date(),
});

export type ContractSignature = z.infer<typeof ContractSignatureSchema>;

export const SignContractSchema = z.object({
  contractId: z.string().uuid(),
  signatureType: SignatureTypeEnum,
  signatureData: z.string().optional(),
});

export type SignContract = z.infer<typeof SignContractSchema>;

// ============================================================================
// CONTRACT APPROVAL
// ============================================================================

export const ContractApprovalSchema = z.object({
  id: z.string().uuid(),
  contractId: z.string().uuid(),
  approverRole: ApproverRoleEnum,
  approverId: z.string().uuid(),
  approvalStatus: ApprovalStatusEnum.default('PENDING'),
  approvedAt: z.date().optional(),
  rejectionReason: z.string().optional(),
  comments: z.string().optional(),
  sequenceOrder: z.number().int(),
  isRequired: z.boolean().default(true),
  canDelegate: z.boolean().default(false),
  delegatedTo: z.string().uuid().optional(),
  dueBy: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ContractApproval = z.infer<typeof ContractApprovalSchema>;

export const ApproveContractSchema = z.object({
  contractId: z.string().uuid(),
  approved: z.boolean(),
  comments: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export type ApproveContract = z.infer<typeof ApproveContractSchema>;

// ============================================================================
// CONTRACT AUDIT LOG
// ============================================================================

export const ContractAuditLogSchema = z.object({
  id: z.string().uuid(),
  contractId: z.string().uuid(),
  tenantId: z.string().uuid(),
  action: z.string().min(1).max(50),
  performedBy: z.string().uuid(),
  performedByName: z.string().min(1).max(255),
  performedByRole: z.string().max(50).optional(),
  fieldName: z.string().max(100).optional(),
  oldValue: z.string().optional(),
  newValue: z.string().optional(),
  changesJson: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.date(),
});

export type ContractAuditLog = z.infer<typeof ContractAuditLogSchema>;

// ============================================================================
// FEE CALCULATION RESULT
// ============================================================================

export const FeeCalculationResultSchema = z.object({
  feeType: FeeTypeEnum,
  percentage: z.number().min(0).max(100).optional(),
  amount: z.number().min(0),
  rateCardLineId: z.string().uuid().optional(),
  calculation: z.string().optional(),
});

export type FeeCalculationResult = z.infer<typeof FeeCalculationResultSchema>;

// ============================================================================
// CONTRACT FILTERS
// ============================================================================

export const ContractFiltersSchema = z.object({
  status: ContractStatusEnum.optional(),
  contractType: z.enum(['VAST', 'INTERIM', 'UITZENDEN']).optional(),
  companyId: z.string().uuid().optional(),
  bureauId: z.string().uuid().optional(),
  candidateId: z.string().uuid().optional(),
  startDateFrom: z.date().optional(),
  startDateTo: z.date().optional(),
  search: z.string().optional(),
});

export type ContractFilters = z.infer<typeof ContractFiltersSchema>;

// ============================================================================
// EXPORTS
// ============================================================================

export const ContractSchemas = {
  ContractTemplate: ContractTemplateSchema,
  CreateContractTemplate: CreateContractTemplateSchema,
  UpdateContractTemplate: UpdateContractTemplateSchema,
  MasterServiceAgreement: MasterServiceAgreementSchema,
  CreateMSA: CreateMSASchema,
  RateCard: RateCardSchema,
  RateCardLine: RateCardLineSchema,
  CreateRateCard: CreateRateCardSchema,
  Contract: ContractSchema,
  CreateContract: CreateContractSchema,
  UpdateContract: UpdateContractSchema,
  ContractSignature: ContractSignatureSchema,
  SignContract: SignContractSchema,
  ContractApproval: ContractApprovalSchema,
  ApproveContract: ApproveContractSchema,
  ContractAuditLog: ContractAuditLogSchema,
  FeeCalculationResult: FeeCalculationResultSchema,
  ContractFilters: ContractFiltersSchema,
};
